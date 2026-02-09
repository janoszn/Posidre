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

using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
	var userManager = services.GetRequiredService<UserManager<AppUser>>();

	// 1. CREATE ROLES (including new SchoolAdmin role)
	foreach (var role in new[] { "Admin", "Student", "Teacher", "SchoolAdmin" })
	{
		if (!await roleManager.RoleExistsAsync(role))
		{
			await roleManager.CreateAsync(new IdentityRole(role));
			Console.WriteLine($"--> Role created: {role}");
		}
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
		else
		{
			Console.WriteLine("--> Test School Admin already exists");
		}
	}

	// 3. SEED TEDP 2.0 TEMPLATE
	try
	{
		var context = services.GetRequiredService<ApplicationDbContext>();

		// Check if template already exists
		if (!await context.Questionnaires.AnyAsync(q => q.Title == "TEDP 2.0"))
		{
			Console.WriteLine("--> Seeding TEDP 2.0 template...");

			var questionnaire = new Questionnaire
			{
				Title = "TEDP 2.0",
				Description = "Trousse d'évaluation des déterminants de la persévérance et de la réussite éducative au secondaire",
				Version = "2.0",
				IsTemplate = true,
				CreatedBy = "system",
				CreatedAt = DateTimeOffset.UtcNow
			};

			context.Questionnaires.Add(questionnaire);
			await context.SaveChangesAsync();

			// Add 20 TEDP 2.0 questions
			var questions = new List<QuestionnaireQuestion>
			{
                // IDENTIFICATION (Questions 1-4)
                new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Année de naissance (ex: 2010)",
					Type = "text",
					Order = 1,
					IsRequired = true
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Sexe biologique",
					Type = "single_choice",
					Order = 2,
					IsRequired = true,
					OptionsJson = "[\"Masculin\",\"Féminin\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Quel âge as-tu ?",
					Type = "single_choice",
					Order = 3,
					IsRequired = true,
					OptionsJson = "[\"12 ans ou moins\",\"13 ans\",\"14 ans\",\"15 ans\",\"16 ans\",\"17 ans\",\"18 ans ou plus\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Quel est ton niveau scolaire actuel ?",
					Type = "single_choice",
					Order = 4,
					IsRequired = true,
					OptionsJson = "[\"6e année\",\"Secondaire 1\",\"Secondaire 2\",\"Secondaire 3\",\"Secondaire 4\",\"Secondaire 5\"]"
				},

                // ACADEMIC (Questions 5-8)
                new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Quelle est ta note moyenne approximative en français ?",
					Type = "single_choice",
					Order = 5,
					IsRequired = false,
					OptionsJson = "[\"0-35%\",\"36-40%\",\"41-45%\",\"46-50%\",\"51-55%\",\"56-60%\",\"61-65%\",\"66-70%\",\"71-75%\",\"76-80%\",\"81-85%\",\"86-90%\",\"91-95%\",\"96-100%\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Quelle est ta note moyenne approximative en mathématiques ?",
					Type = "single_choice",
					Order = 6,
					IsRequired = false,
					OptionsJson = "[\"0-35%\",\"36-40%\",\"41-45%\",\"46-50%\",\"51-55%\",\"56-60%\",\"61-65%\",\"66-70%\",\"71-75%\",\"76-80%\",\"81-85%\",\"86-90%\",\"91-95%\",\"96-100%\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Combien d'heures consacres-tu à tes devoirs et leçons chaque soir ?",
					Type = "single_choice",
					Order = 7,
					IsRequired = false,
					OptionsJson = "[\"Aucune\",\"Moins d'une heure\",\"1 à 2 heures\",\"2 à 3 heures\",\"Plus de 3 heures\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "As-tu redoublé une année scolaire ?",
					Type = "single_choice",
					Order = 8,
					IsRequired = false,
					OptionsJson = "[\"Oui\",\"Non\"]"
				},

                // BEHAVIORAL (Questions 9-12)
                new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Combien de fois as-tu été absent(e) à l'école ce mois-ci ?",
					Type = "single_choice",
					Order = 9,
					IsRequired = false,
					OptionsJson = "[\"0\",\"1-2 fois\",\"3-5 fois\",\"6-10 fois\",\"Plus de 10 fois\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Arrives-tu généralement à l'heure à l'école ?",
					Type = "single_choice",
					Order = 10,
					IsRequired = false,
					OptionsJson = "[\"Toujours\",\"Souvent\",\"Parfois\",\"Rarement\",\"Jamais\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Combien de fois as-tu eu des retenues cette année ?",
					Type = "single_choice",
					Order = 11,
					IsRequired = false,
					OptionsJson = "[\"0\",\"1-2 fois\",\"3-5 fois\",\"Plus de 5 fois\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Participes-tu à des activités parascolaires ?",
					Type = "single_choice",
					Order = 12,
					IsRequired = false,
					OptionsJson = "[\"Oui, régulièrement\",\"Oui, occasionnellement\",\"Non\"]"
				},

                // PSYCHOSOCIAL (Questions 13-20)
                new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Je me sens motivé(e) à réussir à l'école",
					Type = "single_choice",
					Order = 13,
					IsRequired = false,
					OptionsJson = "[\"Totalement en désaccord\",\"En désaccord\",\"Neutre\",\"D'accord\",\"Totalement d'accord\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Je crois que je peux réussir mes études",
					Type = "single_choice",
					Order = 14,
					IsRequired = false,
					OptionsJson = "[\"Totalement en désaccord\",\"En désaccord\",\"Neutre\",\"D'accord\",\"Totalement d'accord\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Mes parents m'encouragent dans mes études",
					Type = "single_choice",
					Order = 15,
					IsRequired = false,
					OptionsJson = "[\"Totalement en désaccord\",\"En désaccord\",\"Neutre\",\"D'accord\",\"Totalement d'accord\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "J'ai des amis qui m'encouragent à l'école",
					Type = "single_choice",
					Order = 16,
					IsRequired = false,
					OptionsJson = "[\"Totalement en désaccord\",\"En désaccord\",\"Neutre\",\"D'accord\",\"Totalement d'accord\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Mes enseignants m'aident quand j'ai des difficultés",
					Type = "single_choice",
					Order = 17,
					IsRequired = false,
					OptionsJson = "[\"Totalement en désaccord\",\"En désaccord\",\"Neutre\",\"D'accord\",\"Totalement d'accord\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Je me sens bien dans mon école",
					Type = "single_choice",
					Order = 18,
					IsRequired = false,
					OptionsJson = "[\"Totalement en désaccord\",\"En désaccord\",\"Neutre\",\"D'accord\",\"Totalement d'accord\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "Je sais ce que je veux faire après le secondaire",
					Type = "single_choice",
					Order = 19,
					IsRequired = false,
					OptionsJson = "[\"Totalement en désaccord\",\"En désaccord\",\"Neutre\",\"D'accord\",\"Totalement d'accord\"]"
				},
				new QuestionnaireQuestion
				{
					QuestionnaireId = questionnaire.Id,
					Text = "J'aime mon école",
					Type = "single_choice",
					Order = 20,
					IsRequired = false,
					OptionsJson = "[\"Totalement en désaccord\",\"En désaccord\",\"Neutre\",\"D'accord\",\"Totalement d'accord\"]"
				}
			};

			context.QuestionnaireQuestions.AddRange(questions);
			await context.SaveChangesAsync();

			Console.WriteLine($"--> TEDP 2.0 template seeded successfully with {questions.Count} questions!");
		}
		else
		{
			Console.WriteLine("--> TEDP 2.0 template already exists");
		}
	}
	catch (Exception ex)
	{
		Console.WriteLine($"--> Error seeding TEDP 2.0 template: {ex.Message}");
		Console.WriteLine($"--> Stack trace: {ex.StackTrace}");
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
