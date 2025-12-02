using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Models;
using Tool_Management_System.DTOs;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RoleController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<RoleResponseDto>>> GetRoles()
        {
            var roles = await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                        .ThenInclude(p => p.App)
                .Include(r => r.UserRoles)
                .Select(r => new RoleResponseDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    UserCount = r.UserRoles.Count,
                    Permissions = r.RolePermissions.Select(rp => new RolePermissionDto
                    {
                        PermissionId = rp.Permission!.PermissionId,
                        PermissionName = rp.Permission.PermissionName,
                        PermissionType = rp.Permission.PermissionType,
                        Description = rp.Permission.Description,
                        AppName = rp.Permission.App != null ? rp.Permission.App.AppName : null
                    }).ToList()
                })
                .ToListAsync();

            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoleResponseDto>> GetRole(int id)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                        .ThenInclude(p => p.App)
                .Include(r => r.UserRoles)
                .Where(r => r.RoleId == id)
                .Select(r => new RoleResponseDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    UserCount = r.UserRoles.Count,
                    Permissions = r.RolePermissions.Select(rp => new RolePermissionDto
                    {
                        PermissionId = rp.Permission!.PermissionId,
                        PermissionName = rp.Permission.PermissionName,
                        PermissionType = rp.Permission.PermissionType,
                        Description = rp.Permission.Description,
                        AppName = rp.Permission.App != null ? rp.Permission.App.AppName : null
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (role == null)
            {
                return NotFound("Role not found");
            }

            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult<RoleResponseDto>> CreateRole([FromBody] CreateRoleDto createRoleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if role name already exists
            if (await _context.Roles.AnyAsync(r => r.RoleName == createRoleDto.RoleName))
            {
                return BadRequest("Bu rol adı zaten mevcut");
            }

            // Create role
            var role = new Role
            {
                RoleName = createRoleDto.RoleName,
                Description = createRoleDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            // Add permissions if provided
            if (createRoleDto.PermissionIds.Any())
            {
                var validPermissions = await _context.Permissions
                    .Where(p => createRoleDto.PermissionIds.Contains(p.PermissionId))
                    .ToListAsync();

                foreach (var permissionId in createRoleDto.PermissionIds)
                {
                    var rolePermission = new RolePermission
                    {
                        RoleId = role.RoleId,
                        PermissionId = permissionId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.RolePermissions.Add(rolePermission);
                }
                await _context.SaveChangesAsync();
            }

            var createdRole = await GetRoleResponse(role.RoleId);
            return CreatedAtAction(nameof(GetRole), new { id = role.RoleId }, createdRole);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RoleResponseDto>> UpdateRole(int id, [FromBody] UpdateRoleDto updateRoleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.RoleId == id);

            if (role == null)
            {
                return NotFound("Role not found");
            }

            // Check if role name already exists (excluding current role)
            if (await _context.Roles.AnyAsync(r => r.RoleName == updateRoleDto.RoleName && r.RoleId != id))
            {
                return BadRequest("Bu rol adı başka bir kayıtta kullanılıyor");
            }

            // Update role
            role.RoleName = updateRoleDto.RoleName;
            role.Description = updateRoleDto.Description;
            role.UpdatedAt = DateTime.UtcNow;

            // Update permissions
            if (updateRoleDto.PermissionIds.Any())
            {
                // Remove existing permissions
                var existingPermissions = role.RolePermissions.ToList();
                _context.RolePermissions.RemoveRange(existingPermissions);

                // Add new permissions
                foreach (var permissionId in updateRoleDto.PermissionIds)
                {
                    var rolePermission = new RolePermission
                    {
                        RoleId = role.RoleId,
                        PermissionId = permissionId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.RolePermissions.Add(rolePermission);
                }
            }

            await _context.SaveChangesAsync();

            var updatedRole = await GetRoleResponse(id);
            return Ok(updatedRole);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .Include(r => r.UserRoles)
                .FirstOrDefaultAsync(r => r.RoleId == id);

            if (role == null)
            {
                return NotFound("Role not found");
            }

            // Check if role is being used
            if (role.UserRoles.Any())
            {
                return BadRequest("Bu rol kullanıcılar tarafından kullanılıyor, silinemez");
            }

            // Remove role permissions first
            _context.RolePermissions.RemoveRange(role.RolePermissions);

            // Remove role
            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return Ok("Role deleted successfully");
        }

        private async Task<RoleResponseDto> GetRoleResponse(int roleId)
        {
            return await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                        .ThenInclude(p => p.App)
                .Include(r => r.UserRoles)
                .Where(r => r.RoleId == roleId)
                .Select(r => new RoleResponseDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    UserCount = r.UserRoles.Count,
                    Permissions = r.RolePermissions.Select(rp => new RolePermissionDto
                    {
                        RolePermissionId = rp.RolePermissionId, // Bu satırı ekleyin
                        RoleId = rp.RoleId, // Bu satırı ekleyin
                        PermissionId = rp.Permission!.PermissionId,
                        PermissionName = rp.Permission.PermissionName,
                        PermissionType = rp.Permission.PermissionType,
                        Description = rp.Permission.Description,
                        AppName = rp.Permission.App != null ? rp.Permission.App.AppName : null
                    }).ToList()
                })
                .FirstAsync();
        }
    }
}
