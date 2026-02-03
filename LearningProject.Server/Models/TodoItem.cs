using Microsoft.AspNetCore.Identity;

namespace LearningProject.Server.Models;
public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }

    // Le lien avec l'utilisateur
    public string UserId { get; set; } = string.Empty;
    public IdentityUser? User { get; set; } // Propriété de navigation
}
