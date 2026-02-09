using Posidre.Server.Data;
using Posidre.Server.Models;
using Posidre.Server.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Posidre.Server.Controllers;

[ApiController]
[Route("api/survey")]
public class SurveyController : ControllerBase
{
	private readonly ApplicationDbContext _context;

	public SurveyController(ApplicationDbContext context)
	{
		_context = context;
	}

	/// <summary>
	/// Valider un code PIN et charger le questionnaire
	/// </summary>
	[HttpGet("validate/{pin}")]
	public async Task<IActionResult> ValidatePin(string pin)
	{
		// Nettoyer le PIN
		pin = pin.Trim();

		if (pin.Length != 6 || !pin.All(char.IsDigit))
		{
			return BadRequest(new ValidatePinResponse
			{
				IsValid = false
			});
		}

		// Trouver le code
		var passationCode = await _context.PassationCodes
			.Include(pc => pc.Passation)
				.ThenInclude(p => p!.Questionnaire)
					.ThenInclude(q => q!.Questions)
			.FirstOrDefaultAsync(pc => pc.Code == pin);

		if (passationCode == null)
		{
			return Ok(new ValidatePinResponse
			{
				IsValid = false
			});
		}

		// Vérifier si la passation est active
		if (!passationCode.Passation!.IsActive || passationCode.Passation.IsArchived)
		{
			return Ok(new ValidatePinResponse
			{
				IsValid = false
			});
		}

		// Vérifier si le code est actif
		if (!passationCode.IsActive)
		{
			return Ok(new ValidatePinResponse
			{
				IsValid = false
			});
		}

		// Vérifier si le code a atteint la limite (4 fois max)
		if (passationCode.TimesUsed >= 4)
		{
			return Ok(new ValidatePinResponse
			{
				IsValid = false
			});
		}

		// Calculer le prochain temps de mesure
		var nextMeasurementTime = passationCode.TimesUsed + 1;

		// Retourner le questionnaire
		var questionnaire = passationCode.Passation.Questionnaire;

		return Ok(new ValidatePinResponse
		{
			IsValid = true,
			PassationId = passationCode.PassationId,
			CodeId = passationCode.Id,
			NextMeasurementTime = nextMeasurementTime,
			Questionnaire = new QuestionnaireDto
			{
				Id = questionnaire!.Id,
				Title = questionnaire.Title,
				Description = questionnaire.Description,
				Questions = questionnaire.Questions
					.OrderBy(q => q.Order)
					.Select(q => new QuestionDto
					{
						Id = q.Id,
						Text = q.Text,
						Type = q.Type,
						Order = q.Order,
						IsRequired = q.IsRequired,
						OptionsJson = q.OptionsJson,
						ScaleMin = q.ScaleMin,
						ScaleMax = q.ScaleMax,
						ScaleMinLabel = q.ScaleMinLabel,
						ScaleMaxLabel = q.ScaleMaxLabel
					})
					.ToList()
			}
		});
	}

	/// <summary>
	/// Soumettre les réponses d'un questionnaire
	/// </summary>
	[HttpPost("submit")]
	public async Task<IActionResult> SubmitSurvey([FromBody] SubmitSurveyRequest request)
	{
		var pin = request.Pin.Trim();

		// Valider le PIN
		if (pin.Length != 6 || !pin.All(char.IsDigit))
		{
			return BadRequest("Code PIN invalide");
		}

		// Trouver le code
		var passationCode = await _context.PassationCodes
			.Include(pc => pc.Passation)
			.FirstOrDefaultAsync(pc => pc.Code == pin);

		if (passationCode == null)
		{
			return BadRequest("Code PIN invalide");
		}

		// Vérifier si la passation est active
		if (!passationCode.Passation!.IsActive || passationCode.Passation.IsArchived)
		{
			return BadRequest("La passation n'est plus active");
		}

		// Vérifier si le code est actif
		if (!passationCode.IsActive)
		{
			return BadRequest("Ce code a déjà été utilisé");
		}

		// Vérifier la limite
		if (passationCode.TimesUsed >= 4)
		{
			return BadRequest("Ce code a atteint le maximum d'utilisations (4)");
		}

		// Calculer le temps de mesure
		var measurementTime = passationCode.TimesUsed + 1;

		// Créer la soumission
		var submission = new Submission
		{
			PassationId = passationCode.PassationId,
			CodeId = passationCode.Id,
			MeasurementTime = measurementTime,
			SubmittedAt = DateTimeOffset.UtcNow,
			CompletedInSeconds = request.CompletedInSeconds
		};

		_context.Submissions.Add(submission);
		await _context.SaveChangesAsync();

		// Créer les réponses
		var answers = request.Answers.Select(a => new Answer
		{
			SubmissionId = submission.Id,
			QuestionId = a.QuestionId,
			Value = a.Value
		}).ToList();

		_context.Answers.AddRange(answers);

		// Mettre à jour le code
		passationCode.TimesUsed++;
		passationCode.IsActive = false; // Désactiver jusqu'à réactivation
		passationCode.LastUsedAt = DateTimeOffset.UtcNow;

		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "Questionnaire soumis avec succès",
			submissionId = submission.Id,
			measurementTime = measurementTime,
			remainingUses = 4 - passationCode.TimesUsed
		});
	}

	/// <summary>
	/// Obtenir les soumissions d'une passation (pour SchoolAdmin)
	/// </summary>
	[HttpGet("passation/{passationId}/submissions")]
	public async Task<IActionResult> GetPassationSubmissions(int passationId)
	{
		var submissions = await _context.Submissions
			.Where(s => s.PassationId == passationId)
			.Include(s => s.Code)
				.ThenInclude(c => c!.Group)
			.Include(s => s.Answers)
				.ThenInclude(a => a.Question)
			.OrderBy(s => s.SubmittedAt)
			.Select(s => new
			{
				s.Id,
				Pin = s.Code!.Code,
				GroupName = s.Code.Group!.GroupName,
				MeasurementTime = s.MeasurementTime,
				SubmittedAt = s.SubmittedAt,
				CompletedInSeconds = s.CompletedInSeconds,
				Answers = s.Answers.Select(a => new
				{
					QuestionId = a.QuestionId,
					QuestionText = a.Question!.Text,
					QuestionOrder = a.Question.Order,
					Value = a.Value
				}).OrderBy(a => a.QuestionOrder).ToList()
			})
			.ToListAsync();

		return Ok(submissions);
	}
}