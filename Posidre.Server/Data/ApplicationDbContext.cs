using Posidre.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Posidre.Server.Data;

public class ApplicationDbContext : IdentityDbContext<AppUser, IdentityRole, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<TodoItem> TodoItems { get; set; }
    public DbSet<Survey> Surveys { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Submission> Submissions { get; set; }
    public DbSet<Answer> Answers { get; set; }
    public DbSet<SurveyPin> SurveyPins { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);
		// Ensure global PIN uniqueness
		modelBuilder.Entity<SurveyPin>()
		.HasIndex(sp => sp.Pin)
		.IsUnique();
		// Cascade delete survey pins when survey deleted
		modelBuilder.Entity<SurveyPin>()
		.HasOne(sp => sp.Survey)
		.WithMany(s => s.Pins)
		.HasForeignKey(sp => sp.SurveyId)
		.OnDelete(DeleteBehavior.Cascade);
	}

}
