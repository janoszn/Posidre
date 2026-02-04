using LearningProject.Server.Data;
using LearningProject.Server.Models;
using LearningProject.Server.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearningProject.Server.Controllers;

[ApiController]
[Route("api/survey")]
[AllowAnonymous] // Autorise l'accès sans login pour tout le contrôleur
public class PublicSurveyController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PublicSurveyController(ApplicationDbContext context)
    {
        _context = context;
    }

    // 1. GET: api/survey/public/123456
    [HttpGet("public/{pin}")]
    public async Task<IActionResult> GetByPin(string pin)
    {
        var survey = await _context.Surveys
            .Include(s => s.Questions) // Charge les questions associées
            .FirstOrDefaultAsync(s => s.PinCode == pin && s.IsActive);

        if (survey == null)
            return NotFound(new { message = "Questionnaire introuvable ou fermé." });

        // On retourne un objet simplifié pour l'étudiant
        return Ok(new
        {
            id = survey.Id,
            title = survey.Title,
            description = survey.Description,
            questions = survey.Questions.Select(q => new {
                id = q.Id,
                text = q.Text,
                type = q.Type,
                order = q.Order,
                isRequired = q.IsRequired,
                optionsJson = q.OptionsJson,
                scaleMin = q.ScaleMin,
                scaleMax = q.ScaleMax,
                scaleMinLabel = q.ScaleMinLabel,
                scaleMaxLabel = q.ScaleMaxLabel
            })
        });
    }

    // 2. POST: api/survey/submit
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SubmissionDto dto)
    {
        // 1. Vérifier si le questionnaire existe et est toujours ouvert
        var survey = await _context.Surveys.AnyAsync(s => s.Id == dto.SurveyId && s.IsActive);
        if (!survey) return BadRequest("Ce questionnaire n'est plus disponible.");

        // 2. Créer l'objet Submission (la "session" de l'élève)
        var submission = new Submission
        {
            SurveyId = dto.SurveyId,
            StudentName = dto.StudentName,
            SubmittedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync(); // Sauvegarde pour générer l'ID de submission

        // 3. Créer chaque réponse individuellement
        var answers = dto.Answers.Select(a => new Answer
        {
            SubmissionId = submission.Id,
            QuestionId = a.QuestionId,
            Value = a.Value
        }).ToList();

        _context.Answers.AddRange(answers);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Réponses enregistrées avec succès !" });
    }
}

// DTO pour la réception des données
public record SubmissionRequest(int SurveyId, string StudentName, List<AnswerDto> Answers);
public record AnswerDto(int QuestionId, string Value);
