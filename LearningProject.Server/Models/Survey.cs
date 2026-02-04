public class Survey
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PinCode { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }

    public List<Question> Questions { get; set; } = new();

    public string TeacherId { get; set; } = string.Empty;
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
    public Survey Survey { get; set; }
}
