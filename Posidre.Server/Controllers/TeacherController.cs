// DEPRECATED USE SCHOOLADMINCONTROLLER INSTEAD




//using Posidre.Server.Data;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using System.Security.Claims;
//using System.Text.Json;

//namespace Posidre.Server.Controllers;

//[ApiController]
//[Route("api/teacher")]
//[Authorize(Roles = "Teacher,Admin")]
//public class TeacherController : ControllerBase
//{
//    private readonly ApplicationDbContext _context;

//    public TeacherController(ApplicationDbContext context)
//    {
//        _context = context;
//    }

//    private string GetCurrentTeacherId()
//    {
//        return User.FindFirstValue(ClaimTypes.NameIdentifier)
//            ?? throw new UnauthorizedAccessException();
//    }

//    // GET: api/teacher/surveys
//    [HttpGet("surveys")]
//    public async Task<IActionResult> GetMySurveys()
//    {
//        var userId = GetCurrentTeacherId();

//        // Filtre les questionnaires de cet enseignant uniquement
//        var surveys = await _context.Surveys
//            .Where(s => s.TeacherId == userId)
//            .OrderByDescending(s => s.CreatedAt)
//            .ToListAsync();

//        return Ok(surveys);
//    }

//    [HttpPost("surveys/create")]
//    public async Task<IActionResult> CreateSurvey()
//    {
//        var userId = GetCurrentTeacherId();
//        var pinCode = await GenerateUniquePinCode();

//        var survey = new Survey
//        {
//            Title = "Questionnaire TEDP 2.0",
//            Description = "Déterminants de la réussite éducative",
//            PinCode = pinCode,
//            TeacherId = userId,
//            CreatedAt = DateTimeOffset.UtcNow,
//            IsActive = true
//        };

//        _context.Surveys.Add(survey);
//        await _context.SaveChangesAsync();

//        var questions = new List<Question>();

//        // --- 1. OPTIONS RÉUTILISABLES (JSON) ---
//        var optLikertAccord = JsonSerializer.Serialize(new[] { "Totalement d'accord", "Assez d'accord", "Un peu d'accord", "Un peu en désaccord", "Assez en désaccord", "Totalement en désaccord" });
//        var optLikertVrai = JsonSerializer.Serialize(new[] { "Tout à fait vrai", "Vrai", "Un peu vrai", "Neutre", "Un peu faux", "Faux", "Tout à fait faux" });
//        var optFrequence = JsonSerializer.Serialize(new[] { "Jamais", "Une ou deux fois", "Plusieurs fois", "Très souvent" });
//        var optNotes = JsonSerializer.Serialize(new[] { "0-35%", "36-40%", "41-45%", "46-50%", "51-55%", "56-60%", "61-65%", "66-70%", "71-75%", "76-80%", "81-85%", "86-90%", "91-95%", "96-100%" });

//        // --- 2. QUESTIONS D'IDENTIFICATION (PAGE 1) ---
//        questions.Add(new Question { Text = "Année de naissance (ex: 2010)", Type = "text", Order = 1, SurveyId = survey.Id, IsRequired = true });
//        questions.Add(new Question { Text = "Sexe biologique (assigné à la naissance)", Type = "single_choice", OptionsJson = "[\"Masculin\",\"Féminin\"]", Order = 2, SurveyId = survey.Id, IsRequired = true });
//        questions.Add(new Question { Text = "Quel âge as-tu ?", Type = "single_choice", OptionsJson = "[\"12 ans ou moins\",\"13 ans\",\"14 ans\",\"15 ans\",\"16 ans\",\"17 ans\",\"18 ans ou plus\"]", Order = 3, SurveyId = survey.Id, IsRequired = true });
//        questions.Add(new Question { Text = "Quel est ton niveau scolaire ?", Type = "single_choice", OptionsJson = "[\"6e année\",\"Secondaire 1\",\"Secondaire 2\",\"Secondaire 3\",\"Secondaire 4\",\"Secondaire 5\",\"Autre\"]", Order = 4, SurveyId = survey.Id, IsRequired = true });

//        // --- 3. EXPÉRIENCE SCOLAIRE (PAGE 2) ---
//        questions.Add(new Question { Text = "Notes moyennes en français", Type = "single_choice", OptionsJson = optNotes, Order = 5, SurveyId = survey.Id });
//        questions.Add(new Question { Text = "Notes moyennes en mathématiques", Type = "single_choice", OptionsJson = optNotes, Order = 6, SurveyId = survey.Id });
//        questions.Add(new Question { Text = "As-tu déjà doublé une année scolaire ?", Type = "single_choice", OptionsJson = "[\"Non\",\"Oui, une fois\",\"Oui, deux fois\",\"Oui, trois fois ou plus\"]", Order = 7, SurveyId = survey.Id });
//        questions.Add(new Question { Text = "Aimes-tu l'école ?", Type = "single_choice", OptionsJson = "[\"Je n'aime pas du tout\",\"Je n'aime pas\",\"J'aime\",\"J'aime beaucoup\"]", Order = 8, SurveyId = survey.Id });

//        // --- 4. COMPORTEMENT (Q12 à Q17) ---
//        var comportements = new Dictionary<int, string> {
//        { 12, "Dérangé ta classe par exprès" },
//        { 13, "Répondu à un enseignant en n'étant pas poli" },
//        { 14, "Utilisé des moyens défendus pour tricher (examens)" },
//        { 15, "Manqué l'école sans excuse valable (journée complète)" },
//        { 16, "Été expulsé de ta classe par ton enseignant" },
//        { 17, "Manqué (foxé) un cours pendant que tu étais à l'école" }
//    };
//        foreach (var item in comportements)
//        {
//            questions.Add(new Question { Text = item.Value, Type = "single_choice", OptionsJson = optFrequence, Order = item.Key, SurveyId = survey.Id });
//        }

//        // --- 5. DIMENSIONS PSYCHOSOCIALES (Q19 à Q24...) ---
//        // On utilise la liste de ton PHP pour les dimensions "Attachement" et "Engagement"
//        var likertQuestions = new Dictionary<int, string> {
//        { 19, "Je suis fier d'être un élève de cette école" },
//        { 20, "J'aime mon école" },
//        { 21, "Je me sens vraiment à ma place dans cette école" },
//        { 22, "Je préférerais être dans une autre école" },
//        { 23, "Cette école est importante pour moi" },
//        { 24, "J'apprécie le défi quand un problème est difficile à résoudre" }
//    };
//        foreach (var item in likertQuestions)
//        {
//            questions.Add(new Question { Text = item.Value, Type = "single_choice", OptionsJson = optLikertAccord, Order = item.Key, SurveyId = survey.Id });
//        }

//        _context.Questions.AddRange(questions);
//        await _context.SaveChangesAsync();

//        return Ok(survey);
//    }


//    // GET: api/teacher/surveys/{id}/submissions
//    [HttpGet("surveys/{id}/submissions")]
//    public async Task<IActionResult> GetSubmissions(int id)
//    {
//        var userId = GetCurrentTeacherId();

//        // Vérifie que le questionnaire appartient bien à cet enseignant
//        var survey = await _context.Surveys.FindAsync(id);
//        if (survey == null || survey.TeacherId != userId)
//        {
//            return NotFound("Questionnaire introuvable");
//        }

//        var submissions = await _context.Submissions
//            .Where(s => s.SurveyId == id)
//            .Include(s => s.Answers)
//            .OrderByDescending(s => s.SubmittedAt)
//            .Select(s => new {
//                s.Id,
//                s.StudentName,
//                s.SubmittedAt,
//                Answers = s.Answers.Select(a => new {
//                    a.Id,
//                    a.Value,
//                    QuestionText = _context.Questions
//                        .Where(q => q.Id == a.QuestionId)
//                        .Select(q => q.Text)
//                        .FirstOrDefault()
//                })
//            })
//            .ToListAsync();

//        return Ok(submissions);
//    }

//    // DELETE: api/teacher/surveys/{id}
//    [HttpDelete("surveys/{id}")]
//    public async Task<IActionResult> DeleteSurvey(int id)
//    {
//        var userId = GetCurrentTeacherId();

//        var survey = await _context.Surveys
//            .Include(s => s.Questions)
//            .FirstOrDefaultAsync(s => s.Id == id);

//        if (survey == null)
//        {
//            return NotFound("Questionnaire introuvable"); // NotFoundObjectResult
//        }

//        if (survey.TeacherId != userId)
//        {
//            return Forbid(); // ForbidResult
//        }

//        var submissions = await _context.Submissions
//            .Where(s => s.SurveyId == id)
//            .Include(s => s.Answers)
//            .ToListAsync();

//        _context.Submissions.RemoveRange(submissions);
//        _context.Surveys.Remove(survey);

//        await _context.SaveChangesAsync();

//        return Ok(new { message = "Questionnaire supprimé avec succès" }); // OkObjectResult
//    }
//    // Méthode privée pour générer un PIN unique
//    private async Task<string> GenerateUniquePinCode()
//    {
//        string pinCode;
//        bool exists;

//        do
//        {
//            // Génère 6 chiffres aléatoires
//            var random = new Random();
//            pinCode = random.Next(100000, 999999).ToString();

//            // Vérifie si ce PIN existe déjà
//            exists = await _context.Surveys.AnyAsync(s => s.PinCode == pinCode);
//        }
//        while (exists);

//        return pinCode;
//    }
//}