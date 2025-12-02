using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.DTOs;
using Tool_Management_System.Services;
using System.ComponentModel.DataAnnotations;

namespace Tool_Management_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;
        private readonly IPasswordService _passwordService;
        private readonly IConfiguration _configuration;

        public AuthController(
            ApplicationDbContext context,
            IJwtService jwtService,
            IPasswordService passwordService,
            IConfiguration configuration)
        {
            _context = context;
            _jwtService = jwtService;
            _passwordService = passwordService;
            _configuration = configuration;
        }

        /// <summary>
        /// User login endpoint
        /// </summary>
        /// <param name="loginDto">Login credentials</param>
        /// <returns>JWT token and user information</returns>
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponseDto<LoginResponseDto>>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Validation
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(ApiResponseDto<LoginResponseDto>.ErrorResult(
                        "Validation failed", errors));
                }

                // Find user
                var user = await _context.Users
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Username == loginDto.Username || u.Email == loginDto.Username);

                if (user == null)
                {
                    return Unauthorized(ApiResponseDto<LoginResponseDto>.ErrorResult(
                        "Invalid username or password"));
                }

                // Check if user is active
                if (user.Status != "Active")
                {
                    return Unauthorized(ApiResponseDto<LoginResponseDto>.ErrorResult(
                        "User account is not active"));
                }

                // Verify password
                if (!_passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    return Unauthorized(ApiResponseDto<LoginResponseDto>.ErrorResult(
                        "Invalid username or password"));
                }

                // Get user roles
                var roles = user.UserRoles
                    .Where(ur => ur.ExpiresAt == null || ur.ExpiresAt > DateTime.UtcNow)
                    .Select(ur => ur.Role.RoleName)
                    .ToList();

                // Generate JWT token
                var token = _jwtService.GenerateToken(
                    user.UserId.ToString(),
                    user.Username,
                    roles);

                // Get token expiration time
                var expireMinutes = Convert.ToDouble(_configuration["Jwt:ExpireMinutes"]);
                var expiresAt = DateTime.UtcNow.AddMinutes(expireMinutes);

                // Create response
                var response = new LoginResponseDto
                {
                    Token = token,
                    Username = user.Username,
                    FullName = user.FullName ?? "",
                    Email = user.Email ?? "",
                    Roles = roles,
                    ExpiresAt = expiresAt
                };

                // Log successful login (optional)
                await LogUserAction(user.UserId, "LOGIN", "User logged in successfully");

                return Ok(ApiResponseDto<LoginResponseDto>.SuccessResult(
                    response, "Login successful"));
            }
            catch (Exception ex)
            {
                // Log the exception (you might want to use a proper logging framework)
                Console.WriteLine($"Login error: {ex.Message}");

                return StatusCode(500, ApiResponseDto<LoginResponseDto>.ErrorResult(
                    "An error occurred during login"));
            }
        }

        /// <summary>
        /// Validate token endpoint
        /// </summary>
        /// <param name="token">JWT token to validate</param>
        /// <returns>Token validation result</returns>
        [HttpPost("validate-token")]
        public async Task<IActionResult> ValidateToken([FromBody] string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(ApiResponseDto<object>.ErrorResult("Token is required"));
                }

                var principal = _jwtService.ValidateToken(token);

                if (principal == null)
                {
                    return Unauthorized(ApiResponseDto<object>.ErrorResult("Invalid token"));
                }

                var userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var username = principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

                // Token'dan role bilgilerini al
                var roleClaims = principal.FindAll(System.Security.Claims.ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToList();

                // Eğer daha detaylı role bilgisi istiyorsanız, veritabanından çekin
                List<RoleResponseDto> detailedRoles = new List<RoleResponseDto>();

                if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int userIdInt))
                {
                    var userRoles = await _context.UserRoles
                        .Include(ur => ur.Role)
                            .ThenInclude(r => r.RolePermissions)
                                .ThenInclude(rp => rp.Permission)
                        .Where(ur => ur.UserId == userIdInt &&
                                    (ur.ExpiresAt == null || ur.ExpiresAt > DateTime.UtcNow))
                        .Select(ur => new RoleResponseDto
                        {
                            RoleId = ur.Role.RoleId,
                            RoleName = ur.Role.RoleName,
                            Description = ur.Role.Description,
                            CreatedAt = ur.Role.CreatedAt,
                            UpdatedAt = ur.Role.UpdatedAt,
                            Permissions = ur.Role.RolePermissions.Select(rp => new RolePermissionDto
                            {
                                RolePermissionId = rp.RolePermissionId,
                                RoleId = rp.RoleId,
                                PermissionId = rp.PermissionId,
                                PermissionName = rp.Permission != null ? rp.Permission.PermissionName : null,
                                PermissionType = rp.Permission != null ? rp.Permission.PermissionType : null,
                                Description = rp.Permission != null ? rp.Permission.Description : null,
                                CreatedAt = rp.CreatedAt,
                                UpdatedAt = rp.UpdatedAt
                            }).ToList()
                        })
                        .ToListAsync();

                    detailedRoles = userRoles;
                }

                var response = new
                {
                    UserId = userId,
                    Username = username,
                    IsValid = true,
                    Roles = roleClaims, // Basit role isimleri
                    DetailedRoles = detailedRoles, // Detaylı role bilgileri (permissions ile birlikte)
                    RoleCount = roleClaims.Count,
                    HasAdminRole = roleClaims.Contains("admin", StringComparer.OrdinalIgnoreCase),
                    HasUserRole = roleClaims.Contains("user", StringComparer.OrdinalIgnoreCase)
                };

                return Ok(ApiResponseDto<object>.SuccessResult(response, "Token is valid"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token validation error: {ex.Message}");
                return StatusCode(500, ApiResponseDto<object>.ErrorResult(
                    "An error occurred during token validation"));
            }
        }

        /// <summary>
        /// Refresh token endpoint (optional - for future implementation)
        /// </summary>
        [HttpPost("refresh-token")]
        public IActionResult RefreshToken()
        {
            // This can be implemented later if you want to add refresh token functionality
            return Ok(ApiResponseDto<object>.ErrorResult("Refresh token functionality not implemented yet"));
        }

        /// <summary>
        /// Logout endpoint (optional - mainly for logging purposes)
        /// </summary>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                // Get user from token if available
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    await LogUserAction(userId, "LOGOUT", "User logged out");
                }

                return Ok(ApiResponseDto<object>.SuccessResult(null, "Logout successful"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Logout error: {ex.Message}");
                return StatusCode(500, ApiResponseDto<object>.ErrorResult(
                    "An error occurred during logout"));
            }
        }

        /// <summary>
        /// Helper method to log user actions
        /// </summary>
        private async Task LogUserAction(int userId, string actionType, string actionDetails)
        {
            try
            {
                var auditLog = new Models.AuditLog
                {
                    UserId = userId,
                    ActionType = actionType,
                    ActionDetails = actionDetails,
                    Timestamp = DateTime.UtcNow,
                    TargetId = userId
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the exception but don't throw it to avoid breaking the main flow
                Console.WriteLine($"Audit log error: {ex.Message}");
            }
        }
    }
}
