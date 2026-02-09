using Posidre.Server.Data;
using Posidre.Server.Models;
using Posidre.Server.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

namespace Posidre.Server.Controllers;

[ApiController]
[Route("api/passation")]
[Authorize(Roles = "SchoolAdmin,Admin")]
public class PassationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PassationController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string GetCurrentAdminId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException();
    }

    // ==================== 1. CRÉATION DES CODES (Section 4.2.2) ====================
    
    /// <summary>
    /// Créer une nouvelle passation avec groupes et codes
    /// </summary>
    [HttpPost("create")]
    public async Task<IActionResult> CreatePassation([FromBody] CreatePassationRequest request)
    {
        var adminId = GetCurrentAdminId();

        // Validation
        if (request.Groups == null || !request.Groups.Any())
            return BadRequest("Au moins un groupe est requis");

        if (request.Groups.Any(g => g.StudentCount < 1 || g.StudentCount > 100))
            return BadRequest("Le nombre d'élèves par groupe doit être entre 1 et 100");

        // Créer la passation
        var passation = new Passation
        {
            QuestionnaireId = request.QuestionnaireId,
            Title = string.IsNullOrWhiteSpace(request.Title) 
                ? $"Passation du {DateTime.Now:dd MMMM yyyy}" 
                : request.Title,
            Description = request.Description,
            SchoolAdminId = adminId,
            SchoolYear = request.SchoolYear,
            TeacherEmail = request.TeacherEmail,
            IsActive = true,
            IsClosed = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.Passations.Add(passation);
        await _context.SaveChangesAsync();

        // Créer les groupes et générer les codes
        var allCodes = new List<PassationCode>();
        var groupCodesResponse = new List<GroupCodesDto>();

        foreach (var groupDto in request.Groups)
        {
            // Créer le groupe
            var group = new PassationGroup
            {
                PassationId = passation.Id,
                GroupName = groupDto.GroupName,
                StudentCount = groupDto.StudentCount,
                Order = groupDto.Order,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.PassationGroups.Add(group);
            await _context.SaveChangesAsync();

            // Générer les codes pour ce groupe
            var codes = await GenerateUniqueCodes(groupDto.StudentCount, passation.Id, group.Id);
            allCodes.AddRange(codes);

            groupCodesResponse.Add(new GroupCodesDto
            {
                GroupId = group.Id,
                GroupName = group.GroupName,
                Codes = codes.Select(c => c.Code).ToList()
            });
        }

        _context.PassationCodes.AddRange(allCodes);
        await _context.SaveChangesAsync();

        return Ok(new PassationWithCodesResponse
        {
            PassationId = passation.Id,
            Title = passation.Title,
            Description = passation.Description,
            GroupCodes = groupCodesResponse
        });
    }

    /// <summary>
    /// Ajouter des codes à une passation existante
    /// </summary>
    [HttpPost("add-codes")]
    public async Task<IActionResult> AddCodesToPassation([FromBody] AddCodesToPassationRequest request)
    {
        var adminId = GetCurrentAdminId();

        var passation = await _context.Passations
            .FirstOrDefaultAsync(p => p.Id == request.PassationId && p.SchoolAdminId == adminId);

        if (passation == null)
            return NotFound("Passation introuvable");

        if (passation.IsArchived)
            return BadRequest("Impossible d'ajouter des codes à une passation archivée");

        var groupCodesResponse = new List<GroupCodesDto>();

        foreach (var groupDto in request.Groups)
        {
            var group = new PassationGroup
            {
                PassationId = passation.Id,
                GroupName = groupDto.GroupName,
                StudentCount = groupDto.StudentCount,
                Order = groupDto.Order,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.PassationGroups.Add(group);
            await _context.SaveChangesAsync();

            var codes = await GenerateUniqueCodes(groupDto.StudentCount, passation.Id, group.Id);
            _context.PassationCodes.AddRange(codes);

            groupCodesResponse.Add(new GroupCodesDto
            {
                GroupId = group.Id,
                GroupName = group.GroupName,
                Codes = codes.Select(c => c.Code).ToList()
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new PassationWithCodesResponse
        {
            PassationId = passation.Id,
            Title = passation.Title,
            Description = passation.Description,
            GroupCodes = groupCodesResponse
        });
    }

    // ==================== 2. RÉACTIVER UN CODE (Section 4.2.3 - Individual) ====================
    
    /// <summary>
    /// Réactiver un code individuel
    /// </summary>
    [HttpPost("reactivate-code")]
    public async Task<IActionResult> ReactivateCode([FromBody] string code)
    {
        var passationCode = await _context.PassationCodes
            .Include(pc => pc.Passation)
            .FirstOrDefaultAsync(pc => pc.Code == code);

        if (passationCode == null)
            return NotFound("Code introuvable");

        if (passationCode.Passation?.SchoolAdminId != GetCurrentAdminId())
            return Forbid();

        if (passationCode.TimesUsed >= 4)
            return BadRequest("Code utilisé 4 fois (maximum atteint). Impossible de réactiver.");

        if (passationCode.Passation.IsArchived)
            return BadRequest("La passation est archivée");

        passationCode.IsActive = true;
        passationCode.LastActivatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Code réactivé avec succès",
            code = code,
            timesUsed = passationCode.TimesUsed,
            remainingUses = 4 - passationCode.TimesUsed
        });
    }

    // ==================== 3. RELANCER UNE PASSATION (Section 4.2.3 - Bulk) ====================
    
    /// <summary>
    /// Relancer une passation (réactiver tous les codes)
    /// </summary>
    [HttpPost("{id}/relaunch")]
    public async Task<IActionResult> RelaunchPassation(int id)
    {
        var adminId = GetCurrentAdminId();

        var passation = await _context.Passations
            .Include(p => p.Codes)
            .Include(p => p.Groups)
            .FirstOrDefaultAsync(p => p.Id == id && p.SchoolAdminId == adminId);

        if (passation == null)
            return NotFound("Passation introuvable");

        if (passation.IsArchived)
            return BadRequest("La passation est archivée");

        var reactivatedCount = 0;
        var maxedOutCount = 0;

        foreach (var code in passation.Codes)
        {
            if (code.TimesUsed < 4)
            {
                code.IsActive = true;
                code.LastActivatedAt = DateTimeOffset.UtcNow;
                reactivatedCount++;
            }
            else
            {
                maxedOutCount++;
            }
        }

        passation.IsActive = true;
        passation.IsClosed = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Passation relancée",
            passationId = passation.Id,
            title = passation.Title,
            codesReactivated = reactivatedCount,
            codesMaxedOut = maxedOutCount,
            totalCodes = passation.Codes.Count
        });
    }

    // ==================== 4. FERMER UNE PASSATION (Section 4.2.4) ====================
    
    /// <summary>
    /// Vérifier le statut d'une passation avant fermeture
    /// </summary>
    [HttpGet("{id}/status")]
    public async Task<IActionResult> GetPassationStatus(int id)
    {
        var adminId = GetCurrentAdminId();

        var passation = await _context.Passations
            .Include(p => p.Codes)
                .ThenInclude(c => c.Group)
            .FirstOrDefaultAsync(p => p.Id == id && p.SchoolAdminId == adminId);

        if (passation == null)
            return NotFound();

        var unusedCodes = passation.Codes
            .Where(c => c.TimesUsed == 0)
            .Select(c => new UnusedCodeDto
            {
                Code = c.Code,
                GroupName = c.Group?.GroupName ?? "Unknown"
            })
            .ToList();

        return Ok(new PassationStatusResponse
        {
            PassationId = passation.Id,
            Title = passation.Title,
            TotalCodes = passation.Codes.Count,
            CodesCompleted = passation.Codes.Count(c => c.TimesUsed > 0),
            CodesUnused = unusedCodes.Count,
            UnusedCodes = unusedCodes
        });
    }

    /// <summary>
    /// Fermer une passation
    /// </summary>
    [HttpPost("{id}/close")]
    public async Task<IActionResult> ClosePassation(int id)
    {
        var adminId = GetCurrentAdminId();

        var passation = await _context.Passations
            .FirstOrDefaultAsync(p => p.Id == id && p.SchoolAdminId == adminId);

        if (passation == null)
            return NotFound();

        if (passation.IsArchived)
            return BadRequest("La passation est archivée");

        passation.IsClosed = true;
        passation.IsActive = false;
        passation.ClosedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Passation fermée avec succès" });
    }

    // ==================== 5. ROUVRIR UNE PASSATION (Section 4.2.5) ====================
    
    /// <summary>
    /// Rouvrir une passation fermée
    /// </summary>
    [HttpPost("{id}/reopen")]
    public async Task<IActionResult> ReopenPassation(int id)
    {
        var adminId = GetCurrentAdminId();

        var passation = await _context.Passations
            .FirstOrDefaultAsync(p => p.Id == id && p.SchoolAdminId == adminId);

        if (passation == null)
            return NotFound();

        if (passation.IsArchived)
            return BadRequest("Impossible de rouvrir une passation archivée");

        passation.IsClosed = false;
        passation.IsActive = true;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Passation rouverte avec succès" });
    }

    // ==================== 6. ARCHIVER UNE PASSATION (Section 4.2.6) ====================
    
    /// <summary>
    /// Archiver (supprimer) une passation
    /// </summary>
    [HttpDelete("{id}/archive")]
    public async Task<IActionResult> ArchivePassation(int id)
    {
        var adminId = GetCurrentAdminId();

        var passation = await _context.Passations
            .Include(p => p.Groups)
            .Include(p => p.Codes)
            .Include(p => p.Submissions)
                .ThenInclude(s => s.Answers)
            .FirstOrDefaultAsync(p => p.Id == id && p.SchoolAdminId == adminId);

        if (passation == null)
            return NotFound();

        // Supprimer toutes les données
        foreach (var submission in passation.Submissions)
        {
            _context.Answers.RemoveRange(submission.Answers);
        }
        
        _context.Submissions.RemoveRange(passation.Submissions);
        _context.PassationCodes.RemoveRange(passation.Codes);
        _context.PassationGroups.RemoveRange(passation.Groups);
        _context.Passations.Remove(passation);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Passation archivée (supprimée) avec succès" });
    }

    // ==================== LISTE DES PASSATIONS ====================
    
    /// <summary>
    /// Lister toutes les passations de l'admin
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllPassations()
    {
        var adminId = GetCurrentAdminId();

        var passations = await _context.Passations
            .Where(p => p.SchoolAdminId == adminId && !p.IsArchived)
            .Include(p => p.Groups)
            .Include(p => p.Codes)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PassationResponse
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                SchoolYear = p.SchoolYear,
                IsActive = p.IsActive,
                IsClosed = p.IsClosed,
                CreatedAt = p.CreatedAt,
                TotalGroups = p.Groups.Count,
                TotalCodes = p.Codes.Count,
                CodesUsed = p.Codes.Count(c => c.TimesUsed > 0),
                CodesAvailable = p.Codes.Count(c => c.IsActive && c.TimesUsed < 4),
                GroupStats = p.Groups.Select(g => new GroupStatsDto
                {
                    GroupId = g.Id,
                    GroupName = g.GroupName,
                    TotalCodes = p.Codes.Count(c => c.GroupId == g.Id),
                    CodesUsed = p.Codes.Count(c => c.GroupId == g.Id && c.TimesUsed > 0)
                }).ToList()
            })
            .ToListAsync();

        return Ok(passations);
    }

    /// <summary>
    /// Télécharger CSV des codes par groupe
    /// </summary>
    [HttpGet("{id}/export-codes")]
    public async Task<IActionResult> ExportCodes(int id)
    {
        var adminId = GetCurrentAdminId();

        var passation = await _context.Passations
            .Include(p => p.Codes)
                .ThenInclude(c => c.Group)
            .FirstOrDefaultAsync(p => p.Id == id && p.SchoolAdminId == adminId);

        if (passation == null)
            return NotFound();

        var csv = new StringBuilder();
        csv.AppendLine("Passation,Groupe,Code,Utilisations,Statut");

        foreach (var code in passation.Codes.OrderBy(c => c.Group!.Order).ThenBy(c => c.Code))
        {
            var status = code.TimesUsed == 0 ? "Non utilisé" 
                : code.TimesUsed >= 4 ? "Maximum atteint (4)" 
                : $"Utilisé {code.TimesUsed} fois";

            csv.AppendLine($"\"{passation.Title}\",\"{code.Group?.GroupName}\",\"{code.Code}\",{code.TimesUsed},\"{status}\"");
        }

        var fileName = $"Codes_{passation.Title.Replace(" ", "_")}_{DateTime.Now:yyyyMMdd}.csv";

        return File(
            Encoding.UTF8.GetBytes(csv.ToString()),
            "text/csv",
            fileName
        );
    }

    // ==================== HELPER METHODS ====================
    
    private async Task<List<PassationCode>> GenerateUniqueCodes(int count, int passationId, int groupId)
    {
        var codes = new List<PassationCode>();
        var existingCodes = await _context.PassationCodes
            .Select(pc => pc.Code)
            .ToHashSetAsync();

        var random = new Random();

        while (codes.Count < count)
        {
            string code = random.Next(100000, 999999).ToString();

            if (!existingCodes.Contains(code) && !codes.Any(c => c.Code == code))
            {
                codes.Add(new PassationCode
                {
                    PassationId = passationId,
                    GroupId = groupId,
                    Code = code,
                    IsActive = true,
                    TimesUsed = 0,
                    CreatedAt = DateTimeOffset.UtcNow
                });
                
                existingCodes.Add(code);
            }
        }

        return codes;
    }
}
