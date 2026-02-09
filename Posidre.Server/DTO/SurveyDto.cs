namespace Posidre.Server.DTO
{
	public class SubmissionDto
	{
		public string Pin { get; set; } = string.Empty; 
		public List<AnswerDto> Answers { get; set; } = new List<AnswerDto>();
	}

	public class AnswerDto
	{
		public int QuestionId { get; set; }
		public string Value { get; set; } = string.Empty;
	}
}