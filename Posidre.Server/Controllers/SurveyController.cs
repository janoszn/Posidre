using Posidre.Server.Data;
using Posidre.Server.Models;
using Posidre.Server.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Posidre.Server.Controllers;

[ApiController]
[Route("api/survey")]
[AllowAnonymous]
public class PublicSurveyController : ControllerBase
{
	private readonly ApplicationDbContext _context;

	public PublicSurveyController(ApplicationDbContext context)
	{
		_context = context;
	}

	// GET: api/survey/validate/{pin}
	// Check if PIN is valid and hasn't been used yet
	[HttpGet("validate/{pin}")]
	public async Task<IActionResult> ValidatePin(string pin)
	{
		var surveyPin = await _context.SurveyPins
			.Include(sp => sp.Survey)
			.ThenInclude(s => s.Questions)
			.FirstOrDefaultAsync(sp => sp.Pin == pin);

		if (surveyPin == null)
			return NotFound(new { message = "Code PIN invalide" });

		if (surveyPin.IsUsed)
			return BadRequest(new { message = "Ce code PIN a déjà été utilisé" });

		if (!surveyPin.Survey.IsActive)
			return BadRequest(new { message = "Ce questionnaire n'est plus actif" });

		// Return survey data WITHOUT requiring student name
		return Ok(new
		{
			isValid = true,
			survey = new
			{
				id = surveyPin.Survey.Id,
				title = surveyPin.Survey.Title,
				description = surveyPin.Survey.Description,
				questions = surveyPin.Survey.Questions
					.OrderBy(q => q.Order)
					.Select(q => new
					{
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
			}
		});
	}

	// POST: api/survey/submit
	[HttpPost("submit")]
	public async Task<IActionResult> Submit([FromBody] SubmissionDto dto)
	{
		// 1. Validate PIN
		var surveyPin = await _context.SurveyPins
			.Include(sp => sp.Survey)
			.FirstOrDefaultAsync(sp => sp.Pin == dto.Pin);

		if (surveyPin == null)
			return BadRequest(new { message = "Code PIN invalide" });

		if (surveyPin.IsUsed)
			return BadRequest(new { message = "Ce code PIN a déjà été utilisé" });

		if (!surveyPin.Survey.IsActive)
			return BadRequest(new { message = "Ce questionnaire n'est plus actif" });

		// 2. Create submission (NO student name)
		var submission = new Submission
		{
			SurveyId = surveyPin.SurveyId,
			PinUsed = dto.Pin,  // Track which PIN was used
			SubmittedAt = DateTime.UtcNow
		};

		_context.Submissions.Add(submission);
		await _context.SaveChangesAsync();

		// 3. Save answers
		var answers = dto.Answers.Select(a => new Answer
		{
			SubmissionId = submission.Id,
			QuestionId = a.QuestionId,
			Value = a.Value
		}).ToList();

		_context.Answers.AddRange(answers);

		// 4. Mark PIN as used
		surveyPin.IsUsed = true;
		surveyPin.CompletedAt = DateTime.UtcNow;
		surveyPin.SubmissionId = submission.Id;

		await _context.SaveChangesAsync();

		return Ok(new { message = "Réponses enregistrées avec succès !" });
	}

	// GET: api/survey/public/{pin} - DEPRECATED but kept for backward compatibility
	[HttpGet("public/{pin}")]
	public async Task<IActionResult> GetByPin(string pin)
	{
		// Redirect to validate endpoint
		return await ValidatePin(pin);
	}
}