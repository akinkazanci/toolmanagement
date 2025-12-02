using System.Security.Claims;

namespace Tool_Management_System.Services
{
    public interface IJwtService
    {
        string GenerateToken(string userId, string username, List<string>? roles = null);
        ClaimsPrincipal? ValidateToken(string token);
    }
}
