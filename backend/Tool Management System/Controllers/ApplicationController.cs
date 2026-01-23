using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Models;
using Tool_Management_System.DTOs;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ApplicationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Applications
        [HttpGet]
        public async Task<ActionResult<List<ApplicationSummaryDto>>> GetApplications()
        {
            var applications = await _context.Applications
                .Include(a => a.Permissions)
                .Include(a => a.UserRoles)
                .Select(a => new ApplicationSummaryDto
                {
                    AppId = a.AppId,
                    AppName = a.AppName,
                    AppType = a.AppType,
                    Description = a.Description,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    PermissionCount = a.Permissions.Count,
                    UserRoleCount = a.UserRoles.Count
                })
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/Applications/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApplicationResponseDto>> GetApplication(int id)
        {
            var application = await _context.Applications
                .Include(a => a.Permissions)
                .Include(a => a.UserRoles)
                    .ThenInclude(ur => ur.User)
                .Include(a => a.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(a => a.AppId == id)
                .Select(a => new ApplicationResponseDto
                {
                    AppId = a.AppId,
                    AppName = a.AppName,
                    AppType = a.AppType,
                    Description = a.Description,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    PermissionCount = a.Permissions.Count,
                    UserRoleCount = a.UserRoles.Count,
                    Permissions = a.Permissions.Select(p => new AppPermissionDto
                    {
                        PermissionId = p.PermissionId,
                        PermissionName = p.PermissionName,
                        PermissionType = p.PermissionType,
                        Description = p.Description
                    }).ToList(),
                    UserRoles = a.UserRoles.Select(ur => new AppUserRoleDto
                    {
                        UserRoleId = ur.UserRoleId,
                        UserId = ur.UserId ?? 0,
                        Username = ur.User != null ? ur.User.Username : "",
                        RoleId = ur.RoleId ?? 0,
                        RoleName = ur.Role != null ? ur.Role.RoleName : "",
                        AssignedAt = ur.AssignedAt,
                        ExpiresAt = ur.ExpiresAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (application == null)
            {
                return NotFound("Application not found");
            }

            return Ok(application);
        }

        // POST: api/Applications
        [HttpPost]
        public async Task<ActionResult<ApplicationResponseDto>> CreateApplication([FromBody] CreateApplicationDto createApplicationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if application name already exists
            if (await _context.Applications.AnyAsync(a => a.AppName == createApplicationDto.AppName))
            {
                return BadRequest("Bu uygulama adı zaten mevcut");
            }

            var application = new Application
            {
                AppName = createApplicationDto.AppName,
                AppType = createApplicationDto.AppType,
                Description = createApplicationDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            var createdApplication = await GetApplicationResponse(application.AppId);
            return CreatedAtAction(nameof(GetApplication), new { id = application.AppId }, createdApplication);
        }

        // PUT: api/Applications/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ApplicationResponseDto>> UpdateApplication(int id, [FromBody] UpdateApplicationDto updateApplicationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var application = await _context.Applications.FindAsync(id);
            if (application == null)
            {
                return NotFound("Application not found");
            }

            // Check if application name already exists (excluding current application)
            if (await _context.Applications.AnyAsync(a => a.AppName == updateApplicationDto.AppName && a.AppId != id))
            {
                return BadRequest("Bu uygulama adı başka bir kayıtta kullanılıyor");
            }

            application.AppName = updateApplicationDto.AppName;
            application.AppType = updateApplicationDto.AppType;
            application.Description = updateApplicationDto.Description;
            application.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedApplication = await GetApplicationResponse(id);
            return Ok(updatedApplication);
        }

        // DELETE: api/Applications/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApplication(int id)
        {
            var application = await _context.Applications
                .Include(a => a.Permissions)
                    .ThenInclude(p => p.RolePermissions)
                .Include(a => a.UserRoles)
                .FirstOrDefaultAsync(a => a.AppId == id);

            if (application == null)
            {
                return NotFound("Application not found");
            }

            // Check if application is being used
            if (application.Permissions.Any() || application.UserRoles.Any())
            {
                return BadRequest("Bu uygulama izinler veya kullanıcı rolleri tarafından kullanılıyor, silinemez");
            }

            _context.Applications.Remove(application);
            await _context.SaveChangesAsync();

            return Ok("Application deleted successfully");
        }

        // GET: api/Applications/5/permissions
        [HttpGet("{id}/permissions")]
        public async Task<ActionResult<List<AppPermissionDto>>> GetApplicationPermissions(int id)
        {
            var applicationExists = await _context.Applications.AnyAsync(a => a.AppId == id);
            if (!applicationExists)
            {
                return NotFound("Application not found");
            }

            var permissions = await _context.Permissions
                .Where(p => p.AppId == id)
                .Select(p => new AppPermissionDto
                {
                    PermissionId = p.PermissionId,
                    PermissionName = p.PermissionName,
                    PermissionType = p.PermissionType,
                    Description = p.Description
                })
                .ToListAsync();

            return Ok(permissions);
        }

        // GET: api/Applications/5/user-roles
        [HttpGet("{id}/user-roles")]
        public async Task<ActionResult<List<AppUserRoleDto>>> GetApplicationUserRoles(int id)
        {
            var applicationExists = await _context.Applications.AnyAsync(a => a.AppId == id);
            if (!applicationExists)
            {
                return NotFound("Application not found");
            }

            var userRoles = await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.AppId == id)
                .Select(ur => new AppUserRoleDto
                {
                    UserRoleId = ur.UserRoleId,
                    UserId = ur.UserId ?? 0,
                    Username = ur.User != null ? ur.User.Username : "",
                    RoleId = ur.RoleId ?? 0,
                    RoleName = ur.Role != null ? ur.Role.RoleName : "",
                    AssignedAt = ur.AssignedAt,
                    ExpiresAt = ur.ExpiresAt
                })
                .ToListAsync();

            return Ok(userRoles);
        }

        // GET: api/Applications/search?name=searchTerm
        [HttpGet("search")]
        public async Task<ActionResult<List<ApplicationSummaryDto>>> SearchApplications([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Arama terimi boş olamaz");
            }

            var applications = await _context.Applications
                .Include(a => a.Permissions)
                .Include(a => a.UserRoles)
                .Where(a => a.AppName.Contains(name) ||
                           (a.Description != null && a.Description.Contains(name)))
                .Select(a => new ApplicationSummaryDto
                {
                    AppId = a.AppId,
                    AppName = a.AppName,
                    AppType = a.AppType,
                    Description = a.Description,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    PermissionCount = a.Permissions.Count,
                    UserRoleCount = a.UserRoles.Count
                })
                .ToListAsync();

            return Ok(applications);
        }

        // ApplicationsController.cs - Sadece YENİ metodları ekleyin (mevcut olanları değiştirmeyin)

        // GET: api/Applications/{id}/users - Bir uygulamadaki tüm kullanıcıları getir
        [HttpGet("{id}/users")]
        public async Task<ActionResult<List<AppUserDetailDto>>> GetApplicationUsers(int id)
        {
            var application = await _context.Applications
                .Include(a => a.UserRoles)
                    .ThenInclude(ur => ur.User)
                .Include(a => a.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(a => a.AppId == id);

            if (application == null)
            {
                return NotFound("Application not found");
            }

            var users = application.UserRoles
                .Where(ur => ur.User != null && ur.Role != null)
                .GroupBy(ur => ur.User)
                .Select(g => new AppUserDetailDto
                {
                    UserId = g.Key.UserId,
                    Username = g.Key.Username,
                    FullName = g.Key.FullName ?? "",
                    Email = g.Key.Email ?? "",
                    Department = g.Key.Department,
                    Status = g.Key.Status ?? "",
                    Roles = g.Select(ur => new UserRoleInAppDto
                    {
                        UserRoleId = ur.UserRoleId,
                        RoleId = ur.RoleId ?? 0,
                        RoleName = ur.Role != null ? ur.Role.RoleName : "",
                        AssignedAt = ur.AssignedAt,
                        ExpiresAt = ur.ExpiresAt,
                        Permissions = ur.Role != null ? ur.Role.RolePermissions
                            .Where(rp => rp.Permission != null && rp.Permission.AppId == id)
                            .Select(rp => new PermissionSummaryDto
                            {
                                PermissionId = rp.Permission.PermissionId,
                                PermissionName = rp.Permission.PermissionName,
                                PermissionType = rp.Permission.PermissionType,
                                Description = rp.Permission.Description
                            }).ToList() : new List<PermissionSummaryDto>()
                    }).ToList()
                }).ToList();

            return Ok(users);
        }

        // GET: api/Applications/{id}/detailed-permissions - Bir uygulamanın detaylı izinlerini getir (mevcut GetApplicationPermissions ile çakışmamak için farklı isim)
        [HttpGet("{id}/detailed-permissions")]
        public async Task<ActionResult<List<AppPermissionDetailDto>>> GetApplicationDetailedPermissions(int id)
        {
            var permissions = await _context.Permissions
                .Include(p => p.RolePermissions)
                    .ThenInclude(rp => rp.Role)
                .Where(p => p.AppId == id)
                .ToListAsync();

            var result = new List<AppPermissionDetailDto>();

            foreach (var permission in permissions)
            {
                var userRolesForApp = await _context.UserRoles
                    .Include(ur => ur.User)
                    .Where(ur => ur.AppId == id &&
                                ur.Role != null &&
                                permission.RolePermissions.Any(rp => rp.RoleId == ur.RoleId))
                    .ToListAsync();

                var assignedRoles = permission.RolePermissions
                    .Where(rp => rp.Role != null)
                    .Select(rp => new RoleSummaryDto
                    {
                        RoleId = rp.Role.RoleId,
                        RoleName = rp.Role.RoleName,
                        Description = rp.Role.Description,
                        UserCount = userRolesForApp.Count(ur => ur.RoleId == rp.RoleId)
                    }).ToList();

                result.Add(new AppPermissionDetailDto
                {
                    PermissionId = permission.PermissionId,
                    PermissionName = permission.PermissionName,
                    PermissionType = permission.PermissionType,
                    Description = permission.Description,
                    CreatedAt = permission.CreatedAt,
                    UpdatedAt = permission.UpdatedAt,
                    RoleCount = permission.RolePermissions.Count,
                    UserCount = userRolesForApp.Select(ur => ur.UserId).Distinct().Count(),
                    AssignedRoles = assignedRoles
                });
            }

            return Ok(result);
        }

        // GET: api/Applications/{id}/stats - Uygulama istatistikleri
        [HttpGet("{id}/stats")]
        public async Task<ActionResult<AppUserStatsDto>> GetApplicationStats(int id)
        {
            var application = await _context.Applications
                .Include(a => a.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(a => a.Permissions)
                .FirstOrDefaultAsync(a => a.AppId == id);

            if (application == null)
            {
                return NotFound("Application not found");
            }

            var now = DateTime.UtcNow;
            var userRoles = application.UserRoles.Where(ur => ur.Role != null).ToList();

            var stats = new AppUserStatsDto
            {
                AppId = application.AppId,
                AppName = application.AppName,
                TotalUsers = userRoles.Select(ur => ur.UserId).Distinct().Count(),
                ActiveUsers = userRoles
                    .Where(ur => !ur.ExpiresAt.HasValue || ur.ExpiresAt.Value > now)
                    .Select(ur => ur.UserId)
                    .Distinct()
                    .Count(),
                ExpiredUsers = userRoles
                    .Where(ur => ur.ExpiresAt.HasValue && ur.ExpiresAt.Value <= now)
                    .Select(ur => ur.UserId)
                    .Distinct()
                    .Count(),
                TotalRoles = userRoles.Select(ur => ur.RoleId).Distinct().Count(),
                TotalPermissions = application.Permissions.Count,
                RoleStats = userRoles
                    .Where(ur => ur.Role != null)
                    .GroupBy(ur => ur.Role)
                    .Select(g => new RoleUserCountDto
                    {
                        RoleId = g.Key.RoleId,
                        RoleName = g.Key.RoleName,
                        UserCount = g.Count(),
                        ActiveUserCount = g.Count(ur => !ur.ExpiresAt.HasValue || ur.ExpiresAt.Value > now)
                    }).ToList()
            };

            return Ok(stats);
        }

        // POST: api/Applications/{id}/assign-user - Kullanıcıya uygulama rolü ata
        [HttpPost("{id}/assign-user")]
        public async Task<ActionResult> AssignUserToApplication(int id, [FromBody] AssignUserToAppDto assignDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Uygulama kontrolü
            var application = await _context.Applications.FindAsync(id);
            if (application == null)
            {
                return NotFound("Application not found");
            }

            // Kullanıcı kontrolü
            var user = await _context.Users.FindAsync(assignDto.UserId);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            // Rol kontrolü
            var role = await _context.Roles.FindAsync(assignDto.RoleId);
            if (role == null)
            {
                return BadRequest("Role not found");
            }

            // Mevcut atama kontrolü
            var existingAssignment = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserId == assignDto.UserId &&
                                          ur.RoleId == assignDto.RoleId &&
                                          ur.AppId == id);

            if (existingAssignment != null)
            {
                return BadRequest("User already has this role in this application");
            }

            // Yeni atama oluştur
            var userRole = new UserRole
            {
                UserId = assignDto.UserId,
                RoleId = assignDto.RoleId,
                AppId = id,
                AssignedAt = DateTime.UtcNow,
                ExpiresAt = assignDto.ExpiresAt,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User successfully assigned to application", userRoleId = userRole.UserRoleId });
        }

        // DELETE: api/Applications/{id}/remove-user/{userRoleId} - Kullanıcının uygulama rolünü kaldır
        [HttpDelete("{id}/remove-user/{userRoleId}")]
        public async Task<ActionResult> RemoveUserFromApplication(int id, int userRoleId)
        {
            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserRoleId == userRoleId && ur.AppId == id);

            if (userRole == null)
            {
                return NotFound("User role assignment not found");
            }

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();

            return Ok("User role successfully removed from application");
        }

        // PUT: api/Applications/{id}/update-user-role/{userRoleId} - Kullanıcının uygulama rolünü güncelle
        [HttpPut("{id}/update-user-role/{userRoleId}")]
        public async Task<ActionResult> UpdateUserRoleInApplication(int id, int userRoleId, [FromBody] UpdateUserRoleDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserRoleId == userRoleId && ur.AppId == id);

            if (userRole == null)
            {
                return NotFound("User role assignment not found");
            }

            // Rol kontrolü
            if (updateDto.RoleId != userRole.RoleId)
            {
                var role = await _context.Roles.FindAsync(updateDto.RoleId);
                if (role == null)
                {
                    return BadRequest("Role not found");
                }
                userRole.RoleId = updateDto.RoleId;
            }

            userRole.ExpiresAt = updateDto.ExpiresAt;
            userRole.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("User role successfully updated");
        }

        // GET: api/Applications/user-permissions/{userId} - Kullanıcının tüm uygulama izinlerini getir
        [HttpGet("user-permissions/{userId}")]
        public async Task<ActionResult<List<UserAppPermissionDto>>> GetUserApplicationPermissions(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var userRoles = await _context.UserRoles
                .Include(ur => ur.App)
                .Include(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                .Where(ur => ur.UserId == userId && ur.App != null && ur.Role != null)
                .ToListAsync();

            var result = userRoles
                .GroupBy(ur => ur.App)
                .Select(g => new UserAppPermissionDto
                {
                    AppId = g.Key.AppId,
                    AppName = g.Key.AppName,
                    AppType = g.Key.AppType,
                    Description = g.Key.Description,
                    UserRoles = g.Select(ur => new UserRoleInAppDto
                    {
                        UserRoleId = ur.UserRoleId,
                        RoleId = ur.RoleId ?? 0,
                        RoleName = ur.Role != null ? ur.Role.RoleName : "",
                        AssignedAt = ur.AssignedAt,
                        ExpiresAt = ur.ExpiresAt,
                        Permissions = ur.Role != null ? ur.Role.RolePermissions
                            .Where(rp => rp.Permission != null && rp.Permission.AppId == g.Key.AppId)
                            .Select(rp => new PermissionSummaryDto
                            {
                                PermissionId = rp.Permission.PermissionId,
                                PermissionName = rp.Permission.PermissionName,
                                PermissionType = rp.Permission.PermissionType,
                                Description = rp.Permission.Description
                            }).ToList() : new List<PermissionSummaryDto>()
                    }).ToList()
                })
                .ToList();

            return Ok(result);
        }

        // GET: api/Applications/available-users/{id} - Uygulamaya atanabilecek kullanıcıları getir
        [HttpGet("available-users/{id}")]
        public async Task<ActionResult<List<UserResponseDto>>> GetAvailableUsersForApplication(int id)
        {
            var assignedUserIds = await _context.UserRoles
                .Where(ur => ur.AppId == id)
                .Select(ur => ur.UserId)
                .Distinct()
                .ToListAsync();

            var availableUsers = await _context.Users
                .Where(u => u.Status == "Active" && !assignedUserIds.Contains(u.UserId))
                .Select(u => new UserResponseDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email ?? "",
                    FullName = u.FullName ?? "",
                    Status = u.Status ?? "",
                    Department = u.Department,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    Roles = new List<UserRoleDto>()
                })
                .ToListAsync();

            return Ok(availableUsers);
        }

        private async Task<ApplicationResponseDto> GetApplicationResponse(int appId)
        {
            return await _context.Applications
                .Include(a => a.Permissions)
                .Include(a => a.UserRoles)
                    .ThenInclude(ur => ur.User)
                .Include(a => a.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(a => a.AppId == appId)
                .Select(a => new ApplicationResponseDto
                {
                    AppId = a.AppId,
                    AppName = a.AppName,
                    AppType = a.AppType,
                    Description = a.Description,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    PermissionCount = a.Permissions.Count,
                    UserRoleCount = a.UserRoles.Count,
                    Permissions = a.Permissions.Select(p => new AppPermissionDto
                    {
                        PermissionId = p.PermissionId,
                        PermissionName = p.PermissionName,
                        PermissionType = p.PermissionType,
                        Description = p.Description
                    }).ToList(),
                    UserRoles = a.UserRoles.Select(ur => new AppUserRoleDto
                    {
                        UserRoleId = ur.UserRoleId,
                        UserId = ur.UserId ?? 0,
                        Username = ur.User != null ? ur.User.Username : "",
                        RoleId = ur.RoleId ?? 0,
                        RoleName = ur.Role != null ? ur.Role.RoleName : "",
                        AssignedAt = ur.AssignedAt,
                        ExpiresAt = ur.ExpiresAt
                    }).ToList()
                })
                .FirstAsync();
        }

        private bool ApplicationExists(int id)
        {
            return _context.Applications.Any(e => e.AppId == id);
        }
    }
}
