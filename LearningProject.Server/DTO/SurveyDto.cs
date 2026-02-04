namespace Posidre.Server.DTO
{
    public class SubmissionDto
    {
        public int SurveyId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public List<AnswerDto> Answers { get; set; } = new List<AnswerDto>();
    }

    public class AnswerDto
    {
        public int QuestionId { get; set; }
        public string Value { get; set; } = string.Empty;
    }
}
