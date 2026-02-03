using LearningProject.Server.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme);

// Enable CORS so React can call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173")  // Vite's default port
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials());
});

// Connection String (à ajouter dans appsettings.json)
var connectionString = builder.Configuration.GetConnectionString("DatabaseConnection");

// Setup EF Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));


// Setup Identity
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();


var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();
app.UseCors("AllowReactApp");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapGroup("/api/auth").MapIdentityApi<IdentityUser>();

app.MapPost("/api/auth/logout", async (SignInManager<IdentityUser> signInManager) =>
{
    await signInManager.SignOutAsync();
    return Results.Ok();
}).RequireAuthorization();

app.MapFallbackToFile("/index.html");

app.Run();
