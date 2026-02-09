using System.Text.Json.Serialization;

namespace Posidre.Server.Models
{
	// ==================== QUESTIONNAIRE (Template) ====================

	/// <summary>
	/// Modèle de questionnaire réutilisable (ex: TEDP 2.0)
	/// </summary>
	public class Questionnaire
	{
		public int Id { get; set; }
		public string Title { get; set; } = string.Empty; // "TEDP 2.0"
		public string Description { get; set; } = string.Empty;
		public string Version { get; set; } = string.Empty; // "2.0"
		public bool IsTemplate { get; set; } = true;
		public string CreatedBy { get; set; } = string.Empty; // SchoolAdminId
		public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

		// Navigation
		public List<QuestionnaireQuestion> Questions { get; set; } = new();
		public List<Passation> Passations { get; set; } = new();
	}

	// ==================== QUESTIONNAIRE QUESTIONS ====================

	/// <summary>
	/// Questions du template de questionnaire
	/// </summary>
	public class QuestionnaireQuestion
	{
		public int Id { get; set; }
		public int QuestionnaireId { get; set; }
		public string Text { get; set; } = string.Empty;
		public string Type { get; set; } = "text"; // text, single_choice, multiple_choice, scale
		public int Order { get; set; }
		public bool IsRequired { get; set; } = true;

		// Pour les choix multiples
		public string? OptionsJson { get; set; }

		// Pour les échelles
		public int? ScaleMin { get; set; }
		public int? ScaleMax { get; set; }
		public string? ScaleMinLabel { get; set; }
		public string? ScaleMaxLabel { get; set; }

		// Navigation
		[JsonIgnore]
		public Questionnaire? Questionnaire { get; set; }
	}

	// ==================== PASSATION (Survey Instance) ====================

	/// <summary>
	/// Instance d'administration d'un questionnaire
	/// </summary>
	public class Passation
	{
		public int Id { get; set; }

		// Lien au template
		public int QuestionnaireId { get; set; }

		// Info administrative
		public string Title { get; set; } = string.Empty; // "Sec 1 - Janvier 2025"
		public string Description { get; set; } = string.Empty;
		public string SchoolAdminId { get; set; } = string.Empty;
		public string SchoolYear { get; set; } = string.Empty; // "2024-2025"
		public string? TeacherEmail { get; set; }

		// États
		public bool IsActive { get; set; } = true; // Codes peuvent être utilisés
		public bool IsClosed { get; set; } = false; // Fermée pour consultation
		public bool IsArchived { get; set; } = false; // Archivée (supprimée)

		// Dates
		public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
		public DateTimeOffset? ClosedAt { get; set; }
		public DateTimeOffset? ArchivedAt { get; set; }

		// Notes
		public string? Notes { get; set; }

		// Navigation
		[JsonIgnore]
		public Questionnaire? Questionnaire { get; set; }
		public List<PassationGroup> Groups { get; set; } = new();
		public List<PassationCode> Codes { get; set; } = new();
		public List<Submission> Submissions { get; set; } = new();
	}

	// ==================== PASSATION GROUP ====================

	/// <summary>
	/// Groupe d'élèves dans une passation (ex: classe 6A)
	/// </summary>
	public class PassationGroup
	{
		public int Id { get; set; }
		public int PassationId { get; set; }
		public string GroupName { get; set; } = string.Empty; // "6A", "Classe de Mme Tremblay"
		public int StudentCount { get; set; } // Nombre prévu d'élèves
		public int Order { get; set; } // Ordre d'affichage
		public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

		// Navigation
		[JsonIgnore]
		public Passation? Passation { get; set; }
		public List<PassationCode> Codes { get; set; } = new();
	}

	// ==================== PASSATION CODE (PIN) ====================

	/// <summary>
	/// Code PIN assigné à un élève pour une passation
	/// </summary>
	public class PassationCode
	{
		public int Id { get; set; }
		public int PassationId { get; set; }
		public int GroupId { get; set; }
		public string Code { get; set; } = string.Empty; // PIN unique (6 chiffres)

		// Statut
		public bool IsActive { get; set; } = true; // Peut être utilisé
		public int TimesUsed { get; set; } = 0; // Nombre d'utilisations (max 4)

		// Dates
		public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
		public DateTimeOffset? LastActivatedAt { get; set; }
		public DateTimeOffset? LastUsedAt { get; set; }

		// Navigation
		[JsonIgnore]
		public Passation? Passation { get; set; }
		[JsonIgnore]
		public PassationGroup? Group { get; set; }
		public List<Submission> Submissions { get; set; } = new();
	}

}