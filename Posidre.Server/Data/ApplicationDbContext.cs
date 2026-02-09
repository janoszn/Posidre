using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Posidre.Server.Models;

namespace Posidre.Server.Data;

public class ApplicationDbContext : IdentityDbContext<AppUser, IdentityRole, string>
{

	public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
	// NEW DbSets
	public DbSet<Questionnaire> Questionnaires { get; set; }
	public DbSet<QuestionnaireQuestion> QuestionnaireQuestions { get; set; }
	public DbSet<Passation> Passations { get; set; }
	public DbSet<PassationGroup> PassationGroups { get; set; }
	public DbSet<PassationCode> PassationCodes { get; set; }
	public DbSet<Submission> Submissions { get; set; }
	public DbSet<Answer> Answers { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		// Questionnaire
		modelBuilder.Entity<Questionnaire>(entity =>
		{
			entity.HasKey(q => q.Id);
			entity.Property(q => q.Title).HasMaxLength(200).IsRequired();
			entity.HasIndex(q => q.CreatedBy);
		});

		// QuestionnaireQuestion
		modelBuilder.Entity<QuestionnaireQuestion>(entity =>
		{
			entity.HasKey(q => q.Id);
			entity.Property(q => q.Text).IsRequired();
			entity.Property(q => q.Type).HasMaxLength(50).IsRequired();

			entity.HasOne(q => q.Questionnaire)
				.WithMany(q => q.Questions)
				.HasForeignKey(q => q.QuestionnaireId)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasIndex(q => q.QuestionnaireId);
		});

		// Passation
		modelBuilder.Entity<Passation>(entity =>
		{
			entity.HasKey(p => p.Id);
			entity.Property(p => p.Title).HasMaxLength(200).IsRequired();
			entity.Property(p => p.SchoolYear).HasMaxLength(20).IsRequired();

			entity.HasOne(p => p.Questionnaire)
				.WithMany(q => q.Passations)
				.HasForeignKey(p => p.QuestionnaireId)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasIndex(p => p.SchoolAdminId);
			entity.HasIndex(p => p.IsArchived);
		});

		// PassationGroup
		modelBuilder.Entity<PassationGroup>(entity =>
		{
			entity.HasKey(g => g.Id);
			entity.Property(g => g.GroupName).HasMaxLength(200).IsRequired();

			entity.HasOne(g => g.Passation)
				.WithMany(p => p.Groups)
				.HasForeignKey(g => g.PassationId)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasIndex(g => g.PassationId);
		});

		// PassationCode
		modelBuilder.Entity<PassationCode>(entity =>
		{
			entity.HasKey(c => c.Id);
			entity.Property(c => c.Code).HasMaxLength(6).IsRequired();

			// Global unique constraint on Code
			entity.HasIndex(c => c.Code).IsUnique();

			entity.HasOne(c => c.Passation)
				.WithMany(p => p.Codes)
				.HasForeignKey(c => c.PassationId)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasOne(c => c.Group)
				.WithMany(g => g.Codes)
				.HasForeignKey(c => c.GroupId)
				.OnDelete(DeleteBehavior.Restrict); // Prevent accidental deletion

			entity.HasIndex(c => c.PassationId);
			entity.HasIndex(c => c.GroupId);
		});

		// Submission
		modelBuilder.Entity<Submission>(entity =>
		{
			entity.HasKey(s => s.Id);

			entity.HasOne(s => s.Passation)
				.WithMany(p => p.Submissions)
				.HasForeignKey(s => s.PassationId)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasOne(s => s.Code)
				.WithMany(c => c.Submissions)
				.HasForeignKey(s => s.CodeId)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasIndex(s => s.PassationId);
			entity.HasIndex(s => s.CodeId);
			entity.HasIndex(s => s.MeasurementTime);
		});

		// Answer
		modelBuilder.Entity<Answer>(entity =>
		{
			entity.HasKey(a => a.Id);
			entity.Property(a => a.Value).IsRequired();

			entity.HasOne(a => a.Submission)
				.WithMany(s => s.Answers)
				.HasForeignKey(a => a.SubmissionId)
				.OnDelete(DeleteBehavior.Cascade);

			entity.HasOne(a => a.Question)
				.WithMany()
				.HasForeignKey(a => a.QuestionId)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasIndex(a => a.SubmissionId);
			entity.HasIndex(a => a.QuestionId);
		});
	}
	
}

