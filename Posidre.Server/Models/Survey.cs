using System.Text.Json.Serialization;

namespace Posidre.Server.Models
{
	public class Survey
	{
		public int Id { get; set; }
		public string Title { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;

		// NEW: School Admin info
		public string SchoolAdminId { get; set; } = string.Empty;
		public string ClassNumber { get; set; } = string.Empty; // e.g., "6A", "Sec 3"
		public int StudentCount { get; set; }
		public string SchoolYear { get; set; } = string.Empty; // e.g., "2024-2025"

		// Email of teacher responsible for distributing PINs
		public string TeacherEmail { get; set; } = string.Empty;

		public bool IsActive { get; set; } = true;
		public DateTimeOffset CreatedAt { get; set; }

		public List<Question> Questions { get; set; } = new();
		public List<SurveyPin> Pins { get; set; } = new(); // NEW: Multiple PINs
	}

	// NEW: Separate PIN model for individual student access
	public class SurveyPin
	{
		public int Id { get; set; }
		public int SurveyId { get; set; }
		public string Pin { get; set; } = string.Empty; // 6-digit unique code
		public bool IsUsed { get; set; } = false; // Track if student completed survey
		public DateTime? CompletedAt { get; set; }

		// Navigation
		[JsonIgnore]
		public Survey? Survey { get; set; }

		// Link to submission (one PIN = one submission)
		public int? SubmissionId { get; set; }
		[JsonIgnore]
		public Submission? Submission { get; set; }
	}

	public class Question
	{
		public int Id { get; set; }
		public string Text { get; set; } = string.Empty;

		// Type de question: "text", "scale", "multiple_choice", "single_choice"
		public string Type { get; set; } = "text";

		// Pour les échelles: valeur min et max
		public int? ScaleMin { get; set; }
		public int? ScaleMax { get; set; }
		public string? ScaleMinLabel { get; set; } // Ex: "Pas du tout d'accord"
		public string? ScaleMaxLabel { get; set; } // Ex: "Tout à fait d'accord"

		// Pour les choix multiples: stocké en JSON
		// Ex: ["Option A", "Option B", "Option C"]
		public string? OptionsJson { get; set; }

		public int SurveyId { get; set; }
		public int Order { get; set; } // Pour l'ordre d'affichage

		public bool IsRequired { get; set; } = true;

		// Navigation properties
		[JsonIgnore]
		public Survey? Survey { get; set; }
	}
}