using Posidre.Server.Data;
using Posidre.Server.Models;
using Posidre.Server.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace Posidre.Server.Controllers;

[ApiController]
[Route("api/schooladmin")]
[Authorize(Roles = "SchoolAdmin,Admin")]
public class SchoolAdminController : ControllerBase
{
	private readonly ApplicationDbContext _context;

	public SchoolAdminController(ApplicationDbContext context)
	{
		_context = context;
	}

	private string GetCurrentAdminId()
	{
		return User.FindFirstValue(ClaimTypes.NameIdentifier)
			?? throw new UnauthorizedAccessException();
	}

	// GET: api/schooladmin/surveys
	[HttpGet("surveys")]
	public async Task<IActionResult> GetMySurveys()
	{
		var adminId = GetCurrentAdminId();

		var surveys = await _context.Surveys
			.Where(s => s.SchoolAdminId == adminId)
			.Include(s => s.Pins)
			.OrderByDescending(s => s.CreatedAt)
			.Select(s => new
			{
				s.Id,
				s.Title,
				s.ClassNumber,
				s.StudentCount,
				s.SchoolYear,
				s.TeacherEmail,
				s.IsActive,
				s.CreatedAt,
				TotalPins = s.Pins.Count,
				UsedPins = s.Pins.Count(p => p.IsUsed),
				TotalSubmissions = _context.Submissions.Count(sub => sub.SurveyId == s.Id)
			})
			.ToListAsync();

		return Ok(surveys);
	}

	// POST: api/schooladmin/surveys/create
	[HttpPost("surveys/create")]
	public async Task<IActionResult> CreateSurvey([FromBody] CreateSurveyRequest request)
	{
		if (request.StudentCount < 1 || request.StudentCount > 100)
			return BadRequest("Student count must be between 1 and 100");

		var adminId = GetCurrentAdminId();

		// 1. Create the survey
		var survey = new Survey
		{
			Title = $"TEDP 2.0 - {request.ClassNumber}",
			Description = "Déterminants de la réussite éducative",
			SchoolAdminId = adminId,
			ClassNumber = request.ClassNumber,
			StudentCount = request.StudentCount,
			SchoolYear = request.SchoolYear,
			TeacherEmail = request.TeacherEmail,
			CreatedAt = DateTimeOffset.UtcNow,
			IsActive = true
		};

		_context.Surveys.Add(survey);
		await _context.SaveChangesAsync(); // Save to get survey ID

		// 2. Generate unique PINs
		var pins = await GenerateUniquePins(request.StudentCount, survey.Id);

		// Save all PINs to database
		foreach (var pin in pins)
		{
			_context.SurveyPins.Add(new SurveyPin
			{
				SurveyId = survey.Id,
				Pin = pin,
				IsUsed = false
			});
		}

		await _context.SaveChangesAsync();

		// 3. Create TEDP 2.0 questions (same as your existing logic)
		var questions = CreateTEDP20Questions(survey.Id);
		_context.Questions.AddRange(questions);
		await _context.SaveChangesAsync();

		return Ok(new
		{
			surveyId = survey.Id,
			message = "Survey created successfully",
			totalPins = pins.Count,
			classNumber = request.ClassNumber
		});
	}

	// GET: api/schooladmin/surveys/{id}/export-correspondence
	[HttpGet("surveys/{id}/export-correspondence")]
	public async Task<IActionResult> ExportCorrespondenceTable(int id)
	{
		var adminId = GetCurrentAdminId();

		var survey = await _context.Surveys
			.Include(s => s.Pins)
			.FirstOrDefaultAsync(s => s.Id == id && s.SchoolAdminId == adminId);

		if (survey == null)
			return NotFound("Survey not found");

		// Generate CSV
		var csv = new StringBuilder();
		csv.AppendLine("PIN,Nom de l'étudiant"); // Header with empty student name column

		foreach (var pin in survey.Pins.OrderBy(p => p.Pin))
		{
			csv.AppendLine($"{pin.Pin},"); // Empty name column for teacher to fill
		}

		var fileName = $"Correspondance_Classe_{survey.ClassNumber}_{survey.SchoolYear.Replace("/", "-")}_{DateTime.Now:yyyyMMdd}.csv";

		return File(
			Encoding.UTF8.GetBytes(csv.ToString()),
			"text/csv",
			fileName
		);
	}

	// GET: api/schooladmin/surveys/{id}/submissions
	[HttpGet("surveys/{id}/submissions")]
	public async Task<IActionResult> GetSubmissions(int id)
	{
		var adminId = GetCurrentAdminId();

		// Verify this survey belongs to this admin
		var survey = await _context.Surveys
			.FirstOrDefaultAsync(s => s.Id == id && s.SchoolAdminId == adminId);

		if (survey == null)
			return NotFound("Survey not found");

		var submissions = await _context.Submissions
			.Where(s => s.SurveyId == id)
			.Include(s => s.Answers)
			.OrderByDescending(s => s.SubmittedAt)
			.Select(s => new
			{
				s.Id,
				s.PinUsed,  // Show PIN instead of student name
				s.SubmittedAt,
				Answers = s.Answers.Select(a => new
				{
					a.Id,
					a.QuestionId,
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

	// DELETE: api/schooladmin/surveys/{id}
	[HttpDelete("surveys/{id}")]
	public async Task<IActionResult> DeleteSurvey(int id)
	{
		var adminId = GetCurrentAdminId();

		var survey = await _context.Surveys
			.Include(s => s.Questions)
			.Include(s => s.Pins)
			.FirstOrDefaultAsync(s => s.Id == id && s.SchoolAdminId == adminId);

		if (survey == null)
			return NotFound("Survey not found");

		// Remove all associated data
		var submissions = await _context.Submissions
			.Where(s => s.SurveyId == id)
			.Include(s => s.Answers)
			.ToListAsync();

		_context.Submissions.RemoveRange(submissions);
		_context.SurveyPins.RemoveRange(survey.Pins);
		_context.Surveys.Remove(survey);

		await _context.SaveChangesAsync();

		return Ok(new { message = "Survey deleted successfully" });
	}

	// PRIVATE METHODS

	private async Task<List<string>> GenerateUniquePins(int count, int surveyId)
	{
		var pins = new HashSet<string>();
		var random = new Random();

		// Get ALL existing PINs globally (to ensure uniqueness across all surveys)
		var existingPins = await _context.SurveyPins
			.Select(p => p.Pin)
			.ToHashSetAsync();

		while (pins.Count < count)
		{
			string pin = random.Next(100000, 999999).ToString();

			if (!existingPins.Contains(pin))
			{
				pins.Add(pin);
				existingPins.Add(pin); // Add to temp set to avoid duplicates in this batch
			}
		}

		return pins.ToList();
	}

	private List<Question> CreateTEDP20Questions(int surveyId)
	{
		// This is your existing TEDP 2.0 question generation logic
		var questions = new List<Question>();

		// Reusable option sets
		var optLikertAccord = JsonSerializer.Serialize(new[] {
			"Totalement d'accord", "Assez d'accord", "Un peu d'accord",
			"Un peu en désaccord", "Assez en désaccord", "Totalement en désaccord"
		});

		var optFrequence = JsonSerializer.Serialize(new[] {
			"Jamais", "Une ou deux fois", "Plusieurs fois", "Très souvent"
		});

		var optNotes = JsonSerializer.Serialize(new[] {
			"0-35%", "36-40%", "41-45%", "46-50%", "51-55%", "56-60%",
			"61-65%", "66-70%", "71-75%", "76-80%", "81-85%", "86-90%",
			"91-95%", "96-100%"
		});

		// IDENTIFICATION QUESTIONS
		questions.Add(new Question
		{
			Text = "Année de naissance (ex: 2010)",
			Type = "text",
			Order = 1,
			SurveyId = surveyId,
			IsRequired = true
		});

		questions.Add(new Question
		{
			Text = "Sexe biologique (assigné à la naissance)",
			Type = "single_choice",
			OptionsJson = JsonSerializer.Serialize(new[] { "Masculin", "Féminin" }),
			Order = 2,
			SurveyId = surveyId,
			IsRequired = true
		});

		questions.Add(new Question
		{
			Text = "Quel âge as-tu ?",
			Type = "single_choice",
			OptionsJson = JsonSerializer.Serialize(new[] {
				"12 ans ou moins", "13 ans", "14 ans", "15 ans",
				"16 ans", "17 ans", "18 ans ou plus"
			}),
			Order = 3,
			SurveyId = surveyId,
			IsRequired = true
		});

		questions.Add(new Question
		{
			Text = "Quel est ton niveau scolaire ?",
			Type = "single_choice",
			OptionsJson = JsonSerializer.Serialize(new[] {
				"6e année", "Secondaire 1", "Secondaire 2", "Secondaire 3",
				"Secondaire 4", "Secondaire 5", "Autre"
			}),
			Order = 4,
			SurveyId = surveyId,
			IsRequired = true
		});

		// ACADEMIC PERFORMANCE
		questions.Add(new Question
		{
			Text = "Notes moyennes en français",
			Type = "single_choice",
			OptionsJson = optNotes,
			Order = 5,
			SurveyId = surveyId
		});

		questions.Add(new Question
		{
			Text = "Notes moyennes en mathématiques",
			Type = "single_choice",
			OptionsJson = optNotes,
			Order = 6,
			SurveyId = surveyId
		});

		questions.Add(new Question
		{
			Text = "As-tu déjà doublé une année scolaire ?",
			Type = "single_choice",
			OptionsJson = JsonSerializer.Serialize(new[] {
				"Non", "Oui, une fois", "Oui, deux fois", "Oui, trois fois ou plus"
			}),
			Order = 7,
			SurveyId = surveyId
		});

		questions.Add(new Question
		{
			Text = "Aimes-tu l'école ?",
			Type = "single_choice",
			OptionsJson = JsonSerializer.Serialize(new[] {
				"Je n'aime pas du tout", "Je n'aime pas", "J'aime", "J'aime beaucoup"
			}),
			Order = 8,
			SurveyId = surveyId
		});

		// BEHAVIOR QUESTIONS (12-17)
		var comportements = new Dictionary<int, string> {
			{ 12, "Dérangé ta classe par exprès" },
			{ 13, "Répondu à un enseignant en n'étant pas poli" },
			{ 14, "Utilisé des moyens défendus pour tricher (examens)" },
			{ 15, "Manqué l'école sans excuse valable (journée complète)" },
			{ 16, "Été expulsé de ta classe par ton enseignant" },
			{ 17, "Manqué (foxé) un cours pendant que tu étais à l'école" }
		};

		foreach (var item in comportements)
		{
			questions.Add(new Question
			{
				Text = item.Value,
				Type = "single_choice",
				OptionsJson = optFrequence,
				Order = item.Key,
				SurveyId = surveyId
			});
		}

		// PSYCHOSOCIAL DIMENSIONS (19-24)
		var likertQuestions = new Dictionary<int, string> {
			{ 19, "Je suis fier d'être un élève de cette école" },
			{ 20, "J'aime mon école" },
			{ 21, "Je me sens vraiment à ma place dans cette école" },
			{ 22, "Je préférerais être dans une autre école" },
			{ 23, "Cette école est importante pour moi" },
			{ 24, "J'apprécie le défi quand un problème est difficile à résoudre" }
		};

		foreach (var item in likertQuestions)
		{
			questions.Add(new Question
			{
				Text = item.Value,
				Type = "single_choice",
				OptionsJson = optLikertAccord,
				Order = item.Key,
				SurveyId = surveyId
			});
		}

		return questions;
	}
}

// DTOs
public record CreateSurveyRequest(
	string ClassNumber,
	int StudentCount,
	string SchoolYear,
	string TeacherEmail
);