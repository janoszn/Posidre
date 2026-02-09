using System.Text.Json.Serialization;

namespace Posidre.Server.Models
{
	// ==================== SUBMISSION ====================

	/// <summary>
	/// Soumission d'un questionnaire (peut être répétée jusqu'à 4 fois)
	/// </summary>
	public class Submission
	{
		public int Id { get; set; }
		public int PassationId { get; set; }
		public int CodeId { get; set; } // Quel code a été utilisé

		// Temps de mesure (1-4 pour mesures longitudinales)
		public int MeasurementTime { get; set; } = 1; // T1, T2, T3, T4

		// Métadonnées
		public DateTimeOffset SubmittedAt { get; set; } = DateTimeOffset.UtcNow;
		public int? CompletedInSeconds { get; set; } // Durée de complétion

		// Navigation
		[JsonIgnore]
		public Passation? Passation { get; set; }
		[JsonIgnore]
		public PassationCode? Code { get; set; }
		public List<Answer> Answers { get; set; } = new();
	}

	// ==================== ANSWER ====================

	/// <summary>
	/// Réponse individuelle à une question
	/// </summary>
	public class Answer
	{
		public int Id { get; set; }
		public int SubmissionId { get; set; }
		public int QuestionId { get; set; } // Lien vers QuestionnaireQuestions
		public string Value { get; set; } = string.Empty;

		// Navigation
		[JsonIgnore]
		public Submission? Submission { get; set; }
		[JsonIgnore]
		public QuestionnaireQuestion? Question { get; set; }
	}
}