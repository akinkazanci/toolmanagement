using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Models;
using Tool_Management_System.DTOs;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserRoleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserRoleController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserRoleResponseDto>>> GetUserRoles()
        {
            var userRoles = await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Include(ur => ur.App)
                .Include(ur => ur.User.UserProjectPermissions)  // ✅ Kullanıcının proje izinlerini getir
                    .ThenInclude(upp => upp.Project)
                .Select(ur => new UserRoleResponseDto
                {
                    UserRoleId = ur.UserRoleId,
                    UserId = ur.UserId,
                    Username = ur.User != null ? ur.User.Username : "",
                    RoleId = ur.RoleId,
                    RoleName = ur.Role != null ? ur.Role.RoleName : "",
                    AppId = ur.AppId,
                    AppName = ur.App != null ? ur.App.AppName : null,
                    AssignedAt = ur.AssignedAt,
                    ExpiresAt = ur.ExpiresAt,
                    CreatedAt = ur.CreatedAt,
                    UpdatedAt = ur.UpdatedAt,

                    // ✅ Projeleri doldur
                    Projects = ur.User.UserProjectPermissions
                        .Where(upp => upp.Project != null && upp.Project.AppId == ur.AppId)
                        .Select(upp => new ProjectDto
                        {
                            ProjectId = upp.Project.ProjectId,
                            ProjectName = upp.Project.ProjectName
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(userRoles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserRoleResponseDto>> GetUserRole(int id)
        {
            var userRole = await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Include(ur => ur.App)
                .Where(ur => ur.UserRoleId == id)
                .Select(ur => new UserRoleResponseDto
                {
                    UserRoleId = ur.UserRoleId,
                    UserId = ur.UserId,
                    Username = ur.User != null ? ur.User.Username : "",
                    RoleId = ur.RoleId,
                    RoleName = ur.Role != null ? ur.Role.RoleName : "",
                    AppId = ur.AppId,
                    AppName = ur.App != null ? ur.App.AppName : null,
                    AssignedAt = ur.AssignedAt,
                    ExpiresAt = ur.ExpiresAt,
                    CreatedAt = ur.CreatedAt,
                    UpdatedAt = ur.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (userRole == null)
            {
                return NotFound("UserRole not found");
            }

            return Ok(userRole);
        }

        [HttpPost]
        public async Task<ActionResult<UserRoleResponseDto>> CreateUserRole([FromBody] CreateUserRoleDto dto)
        {
            // önce UserRole var mı kontrol et
            var existingUserRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur =>
                    ur.UserId == dto.UserId &&
                    ur.RoleId == dto.RoleId &&
                    ur.AppId == dto.AppId);

            if (existingUserRole == null)
            {
                // yoksa yeni oluştur
                existingUserRole = new UserRole
                {
                    UserId = dto.UserId,
                    RoleId = dto.RoleId,
                    AppId = dto.AppId,
                    AssignedAt = DateTime.UtcNow,
                    ExpiresAt = dto.ExpiresAt,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.UserRoles.Add(existingUserRole);
                await _context.SaveChangesAsync();
            }

            // seçilen projeleri UserProjectPermissions’a ekle
            if (dto.ProjectIds != null && dto.ProjectIds.Any())
            {
                // Role ve App üzerinden ilgili PermissionId’yi bul
                var rolePermission = await _context.RolePermissions
                    .Include(rp => rp.Permission)
                    .FirstOrDefaultAsync(rp => rp.RoleId == dto.RoleId && rp.Permission.AppId == dto.AppId);

                if (rolePermission == null)
                {
                    return BadRequest("Seçilen rol için izin bulunamadı.");
                }

                foreach (var projectId in dto.ProjectIds)
                {
                    bool alreadyExists = await _context.UserProjectPermissions.AnyAsync(upp =>
                        upp.UserId == dto.UserId &&
                        upp.ProjectId == projectId &&
                        upp.PermissionId == rolePermission.PermissionId);

                    if (!alreadyExists)
                    {
                        var upp = new UserProjectPermission
                        {
                            UserId = dto.UserId,
                            ProjectId = projectId,
                            PermissionId = rolePermission.PermissionId.Value, // ✅ Explicit cast
                            AssignedAt = DateTime.UtcNow,
                            ExpiresAt = dto.ExpiresAt,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.UserProjectPermissions.Add(upp);
                    }
                }
                await _context.SaveChangesAsync();
            }

            var result = await GetUserRoleResponse(existingUserRole.UserRoleId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserRoleResponseDto>> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userRole = await _context.UserRoles.FindAsync(id);
            if (userRole == null)
                return NotFound("UserRole not found");

            // Validasyonlar
            if (!await _context.Users.AnyAsync(u => u.UserId == dto.UserId))
                return BadRequest("Geçersiz UserId");

            if (!await _context.Roles.AnyAsync(r => r.RoleId == dto.RoleId))
                return BadRequest("Geçersiz RoleId");

            if (dto.AppId != null && !await _context.Applications.AnyAsync(a => a.AppId == dto.AppId))
                return BadRequest("Geçersiz AppId");

            // Güncelle
            userRole.UserId = dto.UserId;
            userRole.RoleId = dto.RoleId;
            userRole.AppId = dto.AppId;
            userRole.ExpiresAt = dto.ExpiresAt;
            userRole.UpdatedAt = DateTime.UtcNow;

            // --- Proje Güncelleme ---
            var existing = _context.UserProjectPermissions.Where(upp => upp.UserId == dto.UserId && upp.Project.AppId == dto.AppId);
            _context.UserProjectPermissions.RemoveRange(existing);

            foreach (var projectId in dto.ProjectIds)
            {
                var upp = new UserProjectPermission
                {
                    UserId = dto.UserId,
                    ProjectId = projectId,
                    AssignedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.UserProjectPermissions.Add(upp);
            }

            await _context.SaveChangesAsync();

            var updatedUserRole = await GetUserRoleResponse(id);
            return Ok(updatedUserRole);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserRole(int id)
        {
            var userRole = await _context.UserRoles.FindAsync(id);
            if (userRole == null)
            {
                return NotFound("UserRole not found");
            }

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();

            return Ok("UserRole deleted successfully");
        }

        private async Task<UserRoleResponseDto> GetUserRoleResponse(int userRoleId)
        {
            return await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Include(ur => ur.App)
                .Include(ur => ur.User.UserProjectPermissions)
                    .ThenInclude(upp => upp.Project)
                .Where(ur => ur.UserRoleId == userRoleId)
                .Select(ur => new UserRoleResponseDto
                {
                    UserRoleId = ur.UserRoleId,
                    UserId = ur.UserId,
                    Username = ur.User != null ? ur.User.Username : "",
                    RoleId = ur.RoleId,
                    RoleName = ur.Role != null ? ur.Role.RoleName : "",
                    AppId = ur.AppId,
                    AppName = ur.App != null ? ur.App.AppName : null,
                    AssignedAt = ur.AssignedAt,
                    ExpiresAt = ur.ExpiresAt,
                    CreatedAt = ur.CreatedAt,
                    UpdatedAt = ur.UpdatedAt,

                    // ✅ Burayı ekliyorsun
                    Projects = ur.User.UserProjectPermissions
                        .Where(upp => upp.Project != null && upp.Project.AppId == ur.AppId)
                        .Select(upp => new ProjectDto
                        {
                            ProjectId = upp.Project.ProjectId,
                            ProjectName = upp.Project.ProjectName
                        })
                        .ToList()
                })
                .FirstAsync();
        }
    }
}
