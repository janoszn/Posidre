using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Posidre.Server.Models;
using Posidre.Server.Data;
using Microsoft.EntityFrameworkCore;

[Authorize] // Bloque les non-connectés
[ApiController]
[Route("api/[controller]")]
public class TodoController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TodoController(ApplicationDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoItem>>> GetMyTodos()
    {
        // On ne récupère que les tâches de l'utilisateur actuel
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _context.TodoItems.Where(t => t.UserId == userId).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<TodoItem>> Create(TodoItem item)
    {
        item.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _context.TodoItems.Add(item);
        await _context.Set<TodoItem>().AddAsync(item);
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")] // La route sera DELETE /api/todo/5
    public async Task<IActionResult> Delete(int id)
    {
        // 1. Récupérer l'ID de l'utilisateur connecté depuis le cookie
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // 2. Chercher la tâche MAIS seulement si elle appartient à cet utilisateur
        var todoItem = await _context.TodoItems
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todoItem == null)
        {
            // Si la tâche n'existe pas OU appartient à quelqu'un d'autre
            return NotFound("Tâche non trouvée ou accès refusé.");
        }

        _context.TodoItems.Remove(todoItem);
        await _context.SaveChangesAsync();

        return NoContent(); // Succès, mais pas de contenu à renvoyer
    }
}