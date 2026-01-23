using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Models;
using Tool_Management_System.DTOs;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolePermissionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RolePermissionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RolePermissionDto>>> GetRolePermissions()
        {
            var rolePermissions = await _context.RolePermissions
                .AsNoTracking()
                .Include(rp => rp.Role)
                .Include(rp => rp.Permission)
                .Select(rp => new RolePermissionDto
                {
                    RolePermissionId = rp.RolePermissionId,
                    RoleId = rp.RoleId,
                    PermissionId = rp.PermissionId,
                    CreatedAt = rp.CreatedAt,
                    UpdatedAt = rp.UpdatedAt,
                    RoleName = rp.Role != null ? rp.Role.RoleName : null,
                    RoleDescription = rp.Role != null ? rp.Role.Description : null,
                    PermissionName = rp.Permission != null ? rp.Permission.PermissionName : null,
                    PermissionType = rp.Permission != null ? rp.Permission.PermissionType : null,
                    PermissionDescription = rp.Permission != null ? rp.Permission.Description : null
                })
                .ToListAsync();

            return Ok(rolePermissions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RolePermissionDto>> GetRolePermission(int id)
        {
            var rolePermission = await _context.RolePermissions
                .AsNoTracking()
                .Include(rp => rp.Role)
                .Include(rp => rp.Permission)
                .Where(rp => rp.RolePermissionId == id)
                .Select(rp => new RolePermissionDto
                {
                    RolePermissionId = rp.RolePermissionId,
                    RoleId = rp.RoleId,
                    PermissionId = rp.PermissionId,
                    CreatedAt = rp.CreatedAt,
                    UpdatedAt = rp.UpdatedAt,
                    RoleName = rp.Role != null ? rp.Role.RoleName : null,
                    RoleDescription = rp.Role != null ? rp.Role.Description : null,
                    PermissionName = rp.Permission != null ? rp.Permission.PermissionName : null,
                    PermissionType = rp.Permission != null ? rp.Permission.PermissionType : null,
                    PermissionDescription = rp.Permission != null ? rp.Permission.Description : null
                })
                .FirstOrDefaultAsync();

            return rolePermission == null ? NotFound() : Ok(rolePermission);
        }

        [HttpGet("by-app-name/{appName}")]
        public async Task<ActionResult<IEnumerable<RolePermissionDto>>> GetRolePermissionsByAppName(string appName)
        {
            var rolePermissions = await _context.RolePermissions
                .Include(rp => rp.Role)
                .Include(rp => rp.Permission)
                .Where(rp => rp.Permission != null && rp.Permission.PermissionName == appName)
                .Select(rp => new RolePermissionDto
                {
                    RolePermissionId = rp.RolePermissionId,
                    RoleId = rp.RoleId,
                    RoleName = rp.Role != null ? rp.Role.RoleName : null,
                    PermissionId = rp.PermissionId,
                    PermissionName = rp.Permission.PermissionName,
                    PermissionType = rp.Permission.PermissionType,
                    PermissionDescription = rp.Permission.Description,
                    CreatedAt = rp.CreatedAt,
                    UpdatedAt = rp.UpdatedAt
                })
                .ToListAsync();

            return Ok(rolePermissions);
        }

        [HttpPost]
        public async Task<ActionResult<RolePermission>> PostRolePermission(RolePermission rolePermission)
        {
            // Aynı rol-izin ilişkisi kontrolü
            if (_context.RolePermissions.Any(rp =>
                rp.RoleId == rolePermission.RoleId &&
                rp.PermissionId == rolePermission.PermissionId))
            {
                return BadRequest("Bu rol-izin ilişkisi zaten mevcut");
            }

            // Geçerlilik kontrolleri
            if (!_context.Roles.Any(r => r.RoleId == rolePermission.RoleId))
                return BadRequest("Geçersiz RoleId");

            if (!_context.Permissions.Any(p => p.PermissionId == rolePermission.PermissionId))
                return BadRequest("Geçersiz PermissionId");

            rolePermission.CreatedAt = DateTime.Now;
            _context.RolePermissions.Add(rolePermission);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRolePermission), new { id = rolePermission.RolePermissionId }, rolePermission);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRolePermission(int id, RolePermission rolePermission)
        {
            if (id != rolePermission.RolePermissionId)
                return BadRequest();

            // Geçerlilik kontrolleri
            if (!_context.Roles.Any(r => r.RoleId == rolePermission.RoleId))
                return BadRequest("Geçersiz RoleId");

            if (!_context.Permissions.Any(p => p.PermissionId == rolePermission.PermissionId))
                return BadRequest("Geçersiz PermissionId");

            rolePermission.UpdatedAt = DateTime.Now;
            _context.Entry(rolePermission).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RolePermissionExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRolePermission(int id)
        {
            var rolePermission = await _context.RolePermissions.FindAsync(id);
            if (rolePermission == null) return NotFound();

            _context.RolePermissions.Remove(rolePermission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RolePermissionExists(int id)
        {
            return _context.RolePermissions.Any(e => e.RolePermissionId == id);
        }
    }
}
