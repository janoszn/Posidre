using LearningProject.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LearningProject.Server.Controllers;
[ApiController]
[Route("api/teacher")]
[Authorize(Roles = "Teacher,Admin")] // Sécurité renforcée
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
        // Pour le moment, on retourne tout (ou filtre par SYSTEM comme ton Seed)
        var surveys = await _context.Surveys.ToListAsync();
        return Ok(surveys);
    }

    // GET: api/teacher/surveys/1/submissions
    [HttpGet("surveys/{id}/submissions")]
    public async Task<IActionResult> GetSubmissions(int id)
    {
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
                    // On récupère le texte de la question via une jointure simple
                    QuestionText = _context.Questions
                        .Where(q => q.Id == a.QuestionId)
                        .Select(q => q.Text)
                        .FirstOrDefault()
                })
            })
            .ToListAsync();

        return Ok(submissions);
    }
}
