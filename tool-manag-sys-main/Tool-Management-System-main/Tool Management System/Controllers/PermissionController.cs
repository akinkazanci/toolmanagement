using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Models;
using Tool_Management_System.DTOs;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PermissionController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Permission/types
        [HttpGet("types")]
        public ActionResult<object> GetPermissionTypes()
        {
            return Ok(new
            {
                types = PermissionTypes.AllTypes,
                descriptions = PermissionTypes.TypeDescriptions
            });
        }

        [HttpGet]
        public async Task<ActionResult<List<PermissionResponseDto>>> GetPermissions()
        {
            var permissions = await _context.Permissions
                .Include(p => p.App)
                .Select(p => new PermissionResponseDto
                {
                    PermissionId = p.PermissionId,
                    PermissionName = p.PermissionName,
                    PermissionType = p.PermissionType,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    AppId = p.AppId,
                    AppName = p.App != null ? p.App.AppName : null
                })
                .ToListAsync();

            return Ok(permissions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PermissionResponseDto>> GetPermission(int id)
        {
            var permission = await _context.Permissions
                .Include(p => p.App)
                .Where(p => p.PermissionId == id)
                .Select(p => new PermissionResponseDto
                {
                    PermissionId = p.PermissionId,
                    PermissionName = p.PermissionName,
                    PermissionType = p.PermissionType,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    AppId = p.AppId,
                    AppName = p.App != null ? p.App.AppName : null
                })
                .FirstOrDefaultAsync();

            if (permission == null)
            {
                return NotFound("Permission not found");
            }

            return Ok(permission);
        }

        [HttpPost]
        public async Task<ActionResult<PermissionResponseDto>> CreatePermission([FromBody] CreatePermissionDto createPermissionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate PermissionType - TAM OLARAK veritabanındaki değerlerle eşleşmeli
            if (!string.IsNullOrEmpty(createPermissionDto.PermissionType) &&
                !PermissionTypes.AllTypes.Contains(createPermissionDto.PermissionType))
            {
                return BadRequest($"Geçersiz PermissionType. Geçerli değerler: {string.Join(", ", PermissionTypes.AllTypes)}");
            }

            // Validate AppId if provided
            if (createPermissionDto.AppId != null && !await _context.Applications.AnyAsync(a => a.AppId == createPermissionDto.AppId))
            {
                return BadRequest("Geçersiz AppId");
            }

            // Check if permission name already exists for the same app
            if (await _context.Permissions.AnyAsync(p => p.PermissionName == createPermissionDto.PermissionName && p.AppId == createPermissionDto.AppId))
            {
                return BadRequest("Bu uygulama için aynı isimde izin zaten mevcut");
            }

            var permission = new Permission
            {
                PermissionName = createPermissionDto.PermissionName,
                PermissionType = createPermissionDto.PermissionType, // Aynen gönderildiği gibi (Read, Write, Execute)
                Description = createPermissionDto.Description,
                AppId = createPermissionDto.AppId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                _context.Permissions.Add(permission);
                await _context.SaveChangesAsync();

                var createdPermission = await GetPermissionResponse(permission.PermissionId);
                return CreatedAtAction(nameof(GetPermission), new { id = permission.PermissionId }, createdPermission);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException?.Message.Contains("CHECK constraint") == true)
                {
                    return BadRequest($"Geçersiz PermissionType değeri. Geçerli değerler: {string.Join(", ", PermissionTypes.AllTypes)}");
                }

                return BadRequest("İzin oluşturulurken bir hata oluştu: " + ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PermissionResponseDto>> UpdatePermission(int id, [FromBody] UpdatePermissionDto updatePermissionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
            {
                return NotFound("Permission not found");
            }

            // Validate PermissionType
            if (!string.IsNullOrEmpty(updatePermissionDto.PermissionType) &&
                !PermissionTypes.AllTypes.Contains(updatePermissionDto.PermissionType))
            {
                return BadRequest($"Geçersiz PermissionType. Geçerli değerler: {string.Join(", ", PermissionTypes.AllTypes)}");
            }

            // Validate AppId if provided
            if (updatePermissionDto.AppId != null && !await _context.Applications.AnyAsync(a => a.AppId == updatePermissionDto.AppId))
            {
                return BadRequest("Geçersiz AppId");
            }

            // Check if permission name already exists for the same app (excluding current permission)
            if (await _context.Permissions.AnyAsync(p => p.PermissionName == updatePermissionDto.PermissionName &&
                                                         p.AppId == updatePermissionDto.AppId &&
                                                         p.PermissionId != id))
            {
                return BadRequest("Bu uygulama için aynı isimde izin zaten mevcut");
            }

            permission.PermissionName = updatePermissionDto.PermissionName;
            permission.PermissionType = updatePermissionDto.PermissionType; // Aynen gönderildiği gibi
            permission.Description = updatePermissionDto.Description;
            permission.AppId = updatePermissionDto.AppId;
            permission.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();

                var updatedPermission = await GetPermissionResponse(id);
                return Ok(updatedPermission);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException?.Message.Contains("CHECK constraint") == true)
                {
                    return BadRequest($"Geçersiz PermissionType değeri. Geçerli değerler: {string.Join(", ", PermissionTypes.AllTypes)}");
                }

                return BadRequest("İzin güncellenirken bir hata oluştu: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermission(int id)
        {
            var permission = await _context.Permissions
                .Include(p => p.RolePermissions)
                .FirstOrDefaultAsync(p => p.PermissionId == id);

            if (permission == null)
            {
                return NotFound("Permission not found");
            }

            // Check if permission is being used
            if (permission.RolePermissions.Any())
            {
                return BadRequest("Bu izin roller tarafından kullanılıyor, silinemez");
            }

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();

            return Ok("Permission deleted successfully");
        }

        // GET: api/Permission/by-app/5
        [HttpGet("by-app/{appId}")]
        public async Task<ActionResult<List<PermissionResponseDto>>> GetPermissionsByApp(int appId)
        {
            var appExists = await _context.Applications.AnyAsync(a => a.AppId == appId);
            if (!appExists)
            {
                return NotFound("Application not found");
            }

            var permissions = await _context.Permissions
                .Include(p => p.App)
                .Where(p => p.AppId == appId)
                .Select(p => new PermissionResponseDto
                {
                    PermissionId = p.PermissionId,
                    PermissionName = p.PermissionName,
                    PermissionType = p.PermissionType,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    AppId = p.AppId,
                    AppName = p.App != null ? p.App.AppName : null
                })
                .ToListAsync();

            return Ok(permissions);
        }

        private async Task<PermissionResponseDto> GetPermissionResponse(int permissionId)
        {
            return await _context.Permissions
                .Include(p => p.App)
                .Where(p => p.PermissionId == permissionId)
                .Select(p => new PermissionResponseDto
                {
                    PermissionId = p.PermissionId,
                    PermissionName = p.PermissionName,
                    PermissionType = p.PermissionType,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    AppId = p.AppId,
                    AppName = p.App != null ? p.App.AppName : null
                })
                .FirstAsync();
        }
    }
}
