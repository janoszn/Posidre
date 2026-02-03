namespace LearningProject.Server.Models
{
    public class Submission
    {
        public int Id { get; set; }
        public int SurveyId { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public string StudentName { get; set; } = string.Empty; 

        // On stocke les réponses sous forme de liste
        public List<Answer> Answers { get; set; } = new();
    }

    public class Answer
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string Value { get; set; } = string.Empty; // La réponse choisie
        public int SubmissionId { get; set; }
    }
}
