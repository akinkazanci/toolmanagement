using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Models;
using Tool_Management_System.DTOs;
using Tool_Management_System.Services;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordService _passwordService;

        public UsersController(ApplicationDbContext context, IPasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<List<UserResponseDto>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Select(u => new UserResponseDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email ?? "",
                    FullName = u.FullName ?? "",
                    Status = u.Status ?? "",
                    Department = u.Department,
                    Location = u.Location, // YENİ EKLENDİ
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    Roles = u.UserRoles.Select(ur => new UserRoleDto
                    {
                        UserRoleId = ur.UserRoleId,
                        RoleId = ur.RoleId ?? 0,
                        RoleName = ur.Role != null ? ur.Role.RoleName : "",
                        Description = ur.Role != null ? ur.Role.Description : null,
                        AssignedAt = ur.AssignedAt,
                        ExpiresAt = ur.ExpiresAt,
                        CreatedAt = ur.CreatedAt,
                        UpdatedAt = ur.UpdatedAt
                    }).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(u => u.UserId == id)
                .Select(u => new UserResponseDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email ?? "",
                    FullName = u.FullName ?? "",
                    Status = u.Status ?? "",
                    Department = u.Department,
                    Location = u.Location, // YENİ EKLENDİ
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    Roles = u.UserRoles.Select(ur => new UserRoleDto
                    {
                        UserRoleId = ur.UserRoleId,
                        RoleId = ur.RoleId ?? 0,
                        RoleName = ur.Role != null ? ur.Role.RoleName : "",
                        Description = ur.Role != null ? ur.Role.Description : null,
                        AssignedAt = ur.AssignedAt,
                        ExpiresAt = ur.ExpiresAt,
                        CreatedAt = ur.CreatedAt,
                        UpdatedAt = ur.UpdatedAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(user);
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if username already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == createUserDto.Username);

            if (existingUser != null)
            {
                return BadRequest("Username already exists");
            }

            // Create new user
            var user = new User
            {
                Username = createUserDto.Username,
                PasswordHash = _passwordService.HashPassword(createUserDto.Password),
                Email = createUserDto.Email,
                FullName = createUserDto.FullName,
                Status = UserStatus.Pending, 
                Department = createUserDto.Department,
                Location = createUserDto.Location,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Assign roles if provided
            if (createUserDto.RoleIds.Any())
            {
                var validRoles = await _context.Roles
                    .Where(r => createUserDto.RoleIds.Contains(r.RoleId))
                    .ToListAsync();

                foreach (var roleId in createUserDto.RoleIds)
                {
                    var userRole = new UserRole
                    {
                        UserId = user.UserId,
                        RoleId = roleId,
                        AssignedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.UserRoles.Add(userRole);
                }
                await _context.SaveChangesAsync();
            }

            // Return created user
            var createdUser = await GetUserResponse(user.UserId);
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, createdUser);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponseDto>> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound("User not found");
            }

            // Update user properties
            user.Username = updateUserDto.Username;
            user.Email = updateUserDto.Email;
            user.FullName = updateUserDto.FullName;
            user.Status = updateUserDto.Status ?? user.Status;
            user.Department = updateUserDto.Department;
            user.Location = updateUserDto.Location; // YENİ EKLENDİ
            user.UpdatedAt = DateTime.UtcNow;

            // Update roles if provided
            if (updateUserDto.RoleIds.Any())
            {
                // Remove existing roles
                var existingRoles = user.UserRoles.ToList();
                _context.UserRoles.RemoveRange(existingRoles);

                // Add new roles
                foreach (var roleId in updateUserDto.RoleIds)
                {
                    var userRole = new UserRole
                    {
                        UserId = user.UserId,
                        RoleId = roleId,
                        AssignedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.UserRoles.Add(userRole);
                }
            }

            await _context.SaveChangesAsync();

            var updatedUser = await GetUserResponse(id);
            return Ok(updatedUser);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound("User not found");
            }

            // Remove user roles first
            _context.UserRoles.RemoveRange(user.UserRoles);

            // Remove user
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User deleted successfully");
        }

        // POST: api/Users/5/change-password
        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Verify current password
            if (!_passwordService.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest("Current password is incorrect");
            }

            // Update password
            user.PasswordHash = _passwordService.HashPassword(changePasswordDto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Password changed successfully");
        }

        private async Task<UserResponseDto> GetUserResponse(int userId)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(u => u.UserId == userId)
                .Select(u => new UserResponseDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email ?? "",
                    FullName = u.FullName ?? "",
                    Status = u.Status ?? "",
                    Department = u.Department,
                    Location = u.Location, // YENİ EKLENDİ
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    Roles = u.UserRoles.Select(ur => new UserRoleDto
                    {
                        UserRoleId = ur.UserRoleId,
                        RoleId = ur.RoleId ?? 0,
                        RoleName = ur.Role != null ? ur.Role.RoleName : "",
                        Description = ur.Role != null ? ur.Role.Description : null,
                        AssignedAt = ur.AssignedAt,
                        ExpiresAt = ur.ExpiresAt,
                        CreatedAt = ur.CreatedAt,
                        UpdatedAt = ur.UpdatedAt
                    }).ToList()
                })
                .FirstAsync();
        }
    }
}
