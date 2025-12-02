using Microsoft.AspNetCore.Mvc;
using Tool_Management_System.Services;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private readonly IJwtService _jwtService;

        public TokenController(IJwtService jwtService)
        {
            _jwtService = jwtService;
        }

        [HttpPost("generate")]
        public IActionResult GenerateToken([FromBody] TokenRequest request)
        {
            try
            {
                var token = _jwtService.GenerateToken(
                    request.UserId,
                    request.Username,
                    request.Roles
                );

                var response = new TokenResponse
                {
                    Token = token,
                    Expires = DateTime.UtcNow.AddMinutes(60),
                    TokenType = "Bearer"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Token generation failed", error = ex.Message });
            }
        }

        [HttpPost("validate")]
        public IActionResult ValidateToken([FromBody] ValidateTokenRequest request)
        {
            try
            {
                var principal = _jwtService.ValidateToken(request.Token);

                if (principal == null)
                {
                    return BadRequest(new { message = "Invalid token" });
                }

                var userId = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
                var username = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.UniqueName)?.Value;
                var roles = principal.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();

                return Ok(new
                {
                    message = "Token is valid",
                    userId = userId,
                    username = username,
                    roles = roles
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Token validation failed", error = ex.Message });
            }
        }
    }

    public class TokenRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public List<string>? Roles { get; set; }
    }

    public class TokenResponse
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expires { get; set; }
        public string TokenType { get; set; } = string.Empty;
    }

    public class ValidateTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }
}
