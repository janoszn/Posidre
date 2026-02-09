using Posidre.Server.Data;
using Posidre.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configure HTTPS
builder.WebHost.ConfigureKestrel(serverOptions =>
{
	serverOptions.ListenLocalhost(5053, listenOptions =>
	{
		listenOptions.UseHttps();
	});
	serverOptions.ListenLocalhost(7053, listenOptions =>
	{
		listenOptions.UseHttps();
	});
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme);

// Enable CORS 
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowReactApp",
		policy => policy.WithOrigins("http://localhost:5173")
					   .AllowAnyHeader()
					   .AllowAnyMethod()
					   .AllowCredentials());
});

// Connection String
var connectionString = builder.Configuration.GetConnectionString("DatabaseConnection");

// Setup EF Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseSqlServer(connectionString));

// Setup Identity — AddRoles<> is what registers RoleManager
builder.Services.AddIdentityApiEndpoints<AppUser>()
	.AddDefaultTokenProviders()
	.AddRoles<IdentityRole>()
	.AddEntityFrameworkStores<ApplicationDbContext>();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();
app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
	app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGroup("/api/auth/identity").MapIdentityApi<AppUser>();

// SEED ROLES
using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
	var userManager = services.GetRequiredService<UserManager<AppUser>>();

	// 1. CREATE ROLES (including new SchoolAdmin role)
	foreach (var role in new[] { "Admin", "Student", "Teacher", "SchoolAdmin" })
	{
		if (!await roleManager.RoleExistsAsync(role))
			await roleManager.CreateAsync(new IdentityRole(role));
	}

	// 2. CREATE TEST SCHOOL ADMIN (for development)
	if (app.Environment.IsDevelopment())
	{
		var testAdminEmail = "schooladmin@test.com";
		var existingAdmin = await userManager.FindByEmailAsync(testAdminEmail);

		if (existingAdmin == null)
		{
			var testAdmin = new AppUser
			{
				UserName = testAdminEmail,
				Email = testAdminEmail,
				EmailConfirmed = true
			};

			var result = await userManager.CreateAsync(testAdmin, "Test123!");

			if (result.Succeeded)
			{
				await userManager.AddToRoleAsync(testAdmin, "SchoolAdmin");
				Console.WriteLine("--> Test School Admin created: schooladmin@test.com / Test123!");
			}
		}
	}

}

// CUSTOM REGISTER endpoint
app.MapPost("/api/auth/register", async (
	RegisterRequest dto,
	UserManager<AppUser> userManager,
	SignInManager<AppUser> signInManager,
	RoleManager<IdentityRole> roleManager) =>
{
	if (!await roleManager.RoleExistsAsync(dto.Role))
		return Results.BadRequest(new { Message = $"Role '{dto.Role}' does not exist." });

	var user = new AppUser { UserName = dto.Email, Email = dto.Email };
	var result = await userManager.CreateAsync(user, dto.Password);

	if (!result.Succeeded)
		return Results.BadRequest(result.Errors);

	await userManager.AddToRoleAsync(user, dto.Role);
	await signInManager.SignInAsync(user, isPersistent: false);

	return Results.Ok(new { Message = "Registration successful", Role = dto.Role });
});

// Re-expose login at the path the frontend expects
app.MapPost("/api/auth/login", async (
	LoginRequest dto,
	SignInManager<AppUser> signInManager) =>
{
	var result = await signInManager.PasswordSignInAsync(dto.Email, dto.Password, isPersistent: true, lockoutOnFailure: true);
	if (!result.Succeeded)
		return Results.Unauthorized();
	return Results.Ok();
});

// GET current user info (email + role)
app.MapGet("/api/auth/me", async (
	HttpContext ctx,
	UserManager<AppUser> userManager) =>
{
	var user = await userManager.GetUserAsync(ctx.User);
	if (user == null)
		return Results.Unauthorized();

	var roles = await userManager.GetRolesAsync(user);

	return Results.Json(new
	{
		Email = user.Email,
		Role = roles.FirstOrDefault()
	});
}).RequireAuthorization();

// LOGOUT
app.MapPost("/api/auth/logout", async (SignInManager<AppUser> signInManager) =>
{
	await signInManager.SignOutAsync();
	return Results.Ok();
}).RequireAuthorization();

app.MapFallbackToFile("/index.html");

app.Run();

// DTOs
public record RegisterRequest(string Email, string Password, string Role);