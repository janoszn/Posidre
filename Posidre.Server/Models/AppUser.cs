using Microsoft.AspNetCore.Identity;

namespace Posidre.Server.Models;

public class AppUser : IdentityUser
{
    // IdentityUser already gives you:
    // - Id, Email, UserName, PasswordHash, etc.

    // Add your own properties here as needed:
    public string? DisplayName { get; set; }

    public string? ProfilePictureUrl { get; set; }

    public string? ClassNumber { get; set; }
}