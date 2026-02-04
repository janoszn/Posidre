using LearningProject.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace LearningProject.Server.Controllers;

[ApiController]
[Route("api/teacher")]
[Authorize(Roles = "Teacher,Admin")]
public class TeacherController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TeacherController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/teacher/surveys
    [HttpGet("surveys")]
    public async Task<IActionResult> GetMySurveys()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Filtre les questionnaires de cet enseignant uniquement
        var surveys = await _context.Surveys
            .Where(s => s.TeacherId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(surveys);
    }

    // POST: api/teacher/surveys/create
    [HttpPost("surveys/create")]
    public async Task<IActionResult> CreateSurvey()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var pinCode = await GenerateUniquePinCode();

        var survey = new Survey
        {
            Title = "Questionnaire POSIDRE",
            Description = "Questionnaire sur les déterminants de la réussite éducative",
            PinCode = pinCode,
            TeacherId = userId,
            CreatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };

        _context.Surveys.Add(survey);
        await _context.SaveChangesAsync();

        // Crée les questions avec différents types
        var questions = new List<Question>
    {
        // Question 1: Échelle 0-10
        new Question
        {
            Text = "Comment évaluez-vous votre motivation scolaire?",
            Type = "scale",
            ScaleMin = 0,
            ScaleMax = 10,
            ScaleMinLabel = "Aucune motivation",
            ScaleMaxLabel = "Très motivé",
            SurveyId = survey.Id,
            Order = 1,
            IsRequired = true
        },
        
        // Question 2: Choix multiple (plusieurs réponses possibles)
        new Question
        {
            Text = "Quels sont vos principaux défis d'apprentissage? (Plusieurs choix possibles)",
            Type = "multiple_choice",
            OptionsJson = JsonSerializer.Serialize(new[]
            {
                "Gestion du temps",
                "Compréhension de la matière",
                "Concentration",
                "Motivation",
                "Ressources insuffisantes",
                "Autre"
            }),
            SurveyId = survey.Id,
            Order = 2,
            IsRequired = true
        },
        
        // Question 3: Choix unique (une seule réponse)
        new Question
        {
            Text = "Quel est votre environnement d'étude principal?",
            Type = "single_choice",
            OptionsJson = JsonSerializer.Serialize(new[]
            {
                "À la maison",
                "À la bibliothèque",
                "Dans un café",
                "À l'école",
                "Autre"
            }),
            SurveyId = survey.Id,
            Order = 3,
            IsRequired = true
        },
        
        // Question 4: Texte libre
        new Question
        {
            Text = "Décrivez vos objectifs académiques pour cette année:",
            Type = "text",
            SurveyId = survey.Id,
            Order = 4,
            IsRequired = false
        },
        
        // Question 5: Échelle 1-5
        new Question
        {
            Text = "À quel point vous sentez-vous soutenu par vos enseignants?",
            Type = "scale",
            ScaleMin = 1,
            ScaleMax = 5,
            ScaleMinLabel = "Pas du tout",
            ScaleMaxLabel = "Énormément",
            SurveyId = survey.Id,
            Order = 5,
            IsRequired = true
        },
        
        // Question 6: Texte libre court
        new Question
        {
            Text = "Quels soutiens ou ressources vous aideraient le plus?",
            Type = "text",
            SurveyId = survey.Id,
            Order = 6,
            IsRequired = false
        }
    };

        _context.Questions.AddRange(questions);
        await _context.SaveChangesAsync();

        return Ok(survey);
    }


    // GET: api/teacher/surveys/{id}/submissions
    [HttpGet("surveys/{id}/submissions")]
    public async Task<IActionResult> GetSubmissions(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Vérifie que le questionnaire appartient bien à cet enseignant
        var survey = await _context.Surveys.FindAsync(id);
        if (survey == null || survey.TeacherId != userId)
        {
            return NotFound("Questionnaire introuvable");
        }

        var submissions = await _context.Submissions
            .Where(s => s.SurveyId == id)
            .Include(s => s.Answers)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new {
                s.Id,
                s.StudentName,
                s.SubmittedAt,
                Answers = s.Answers.Select(a => new {
                    a.Id,
                    a.Value,
                    QuestionText = _context.Questions
                        .Where(q => q.Id == a.QuestionId)
                        .Select(q => q.Text)
                        .FirstOrDefault()
                })
            })
            .ToListAsync();

        return Ok(submissions);
    }

    // DELETE: api/teacher/surveys/{id}
    [HttpDelete("surveys/{id}")]
    public async Task<IActionResult> DeleteSurvey(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Trouve le questionnaire
        var survey = await _context.Surveys
            .Include(s => s.Questions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (survey == null)
        {
            return NotFound("Questionnaire introuvable");
        }

        // Vérifie que le questionnaire appartient bien à cet enseignant
        if (survey.TeacherId != userId)
        {
            return Forbid();
        }

        // Supprime toutes les soumissions et réponses associées
        var submissions = await _context.Submissions
            .Where(s => s.SurveyId == id)
            .Include(s => s.Answers)
            .ToListAsync();

        _context.Submissions.RemoveRange(submissions);

        // Supprime le questionnaire (les questions seront supprimées en cascade si configuré)
        _context.Surveys.Remove(survey);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Questionnaire supprimé avec succès" });
    }

    // Méthode privée pour générer un PIN unique
    private async Task<string> GenerateUniquePinCode()
    {
        string pinCode;
        bool exists;

        do
        {
            // Génère 6 chiffres aléatoires
            var random = new Random();
            pinCode = random.Next(100000, 999999).ToString();

            // Vérifie si ce PIN existe déjà
            exists = await _context.Surveys.AnyAsync(s => s.PinCode == pinCode);
        }
        while (exists);

        return pinCode;
    }
}