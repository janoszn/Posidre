namespace Posidre.Server.DTO
{
	// ==================== CREATE PASSATION ====================

	public class CreatePassationRequest
	{
		public int QuestionnaireId { get; set; }
		public string Title { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;
		public string SchoolYear { get; set; } = string.Empty;
		public string? TeacherEmail { get; set; }
		public List<PassationGroupDto> Groups { get; set; } = new();
	}

	public class PassationGroupDto
	{
		public string GroupName { get; set; } = string.Empty;
		public int StudentCount { get; set; }
		public int Order { get; set; }
	}

	// ==================== ADD CODES TO EXISTING PASSATION ====================

	public class AddCodesToPassationRequest
	{
		public int PassationId { get; set; }
		public List<PassationGroupDto> Groups { get; set; } = new();
	}

	// ==================== PASSATION RESPONSE ====================

	public class PassationResponse
	{
		public int Id { get; set; }
		public string Title { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;
		public string SchoolYear { get; set; } = string.Empty;
		public bool IsActive { get; set; }
		public bool IsClosed { get; set; }
		public DateTimeOffset CreatedAt { get; set; }

		// Stats
		public int TotalGroups { get; set; }
		public int TotalCodes { get; set; }
		public int CodesUsed { get; set; }
		public int CodesAvailable { get; set; }
		public List<GroupStatsDto> GroupStats { get; set; } = new();
	}

	public class GroupStatsDto
	{
		public int GroupId { get; set; }
		public string GroupName { get; set; } = string.Empty;
		public int TotalCodes { get; set; }
		public int CodesUsed { get; set; }
	}

	// ==================== PASSATION WITH CODES ====================

	public class PassationWithCodesResponse
	{
		public int PassationId { get; set; }
		public string Title { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;
		public List<GroupCodesDto> GroupCodes { get; set; } = new();
	}

	public class GroupCodesDto
	{
		public int GroupId { get; set; }
		public string GroupName { get; set; } = string.Empty;
		public List<string> Codes { get; set; } = new();
	}

	// ==================== PASSATION STATUS ====================

	public class PassationStatusResponse
	{
		public int PassationId { get; set; }
		public string Title { get; set; } = string.Empty;
		public int TotalCodes { get; set; }
		public int CodesCompleted { get; set; }
		public int CodesUnused { get; set; }
		public List<UnusedCodeDto> UnusedCodes { get; set; } = new();
	}

	public class UnusedCodeDto
	{
		public string Code { get; set; } = string.Empty;
		public string GroupName { get; set; } = string.Empty;
	}

	// ==================== VALIDATE PIN ====================

	public class ValidatePinResponse
	{
		public bool IsValid { get; set; }
		public int? PassationId { get; set; }
		public int? CodeId { get; set; }
		public int? NextMeasurementTime { get; set; } // T1, T2, T3, T4
		public QuestionnaireDto? Questionnaire { get; set; }
	}

	public class QuestionnaireDto
	{
		public int Id { get; set; }
		public string Title { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;
		public List<QuestionDto> Questions { get; set; } = new();
	}

	public class QuestionDto
	{
		public int Id { get; set; }
		public string Text { get; set; } = string.Empty;
		public string Type { get; set; } = string.Empty;
		public int Order { get; set; }
		public bool IsRequired { get; set; }
		public string? OptionsJson { get; set; }
		public int? ScaleMin { get; set; }
		public int? ScaleMax { get; set; }
		public string? ScaleMinLabel { get; set; }
		public string? ScaleMaxLabel { get; set; }
	}

	// ==================== SUBMIT SURVEY ====================

	public class SubmitSurveyRequest
	{
		public string Pin { get; set; } = string.Empty;
		public List<AnswerSubmissionDto> Answers { get; set; } = new();
		public int? CompletedInSeconds { get; set; }
	}

	public class AnswerSubmissionDto
	{
		public int QuestionId { get; set; }
		public string Value { get; set; } = string.Empty;
	}
}