using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Dtos;
using Tool_Management_System.Models;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserProjectPermissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserProjectPermissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1) Tüm kayıtları getir
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserProjectPermission>>> GetAll()
        {
            return await _context.UserProjectPermissions
                .Include(upp => upp.User)
                .Include(upp => upp.Project)
                .Include(upp => upp.Permission)
                .ToListAsync();
        }

        // 2) Kullanıcı bazlı getir
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<UserProjectPermission>>> GetByUser(int userId)
        {
            return await _context.UserProjectPermissions
                .Where(upp => upp.UserId == userId)
                .Include(upp => upp.Project)
                .Include(upp => upp.Permission)
                .ToListAsync();
        }

        // 3) Yeni yetki ata
        [HttpPost]
        public async Task<ActionResult<UserProjectPermission>> AssignPermission([FromBody] UserProjectPermissionCreateDto dto)
        {
            var userProjectPermission = new UserProjectPermission
            {
                UserId = dto.UserId,
                ProjectId = dto.ProjectId,
                PermissionId = dto.PermissionId,
                AssignedAt = DateTime.UtcNow,
                ExpiresAt = dto.ExpiresAt,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserProjectPermissions.Add(userProjectPermission);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByUser), new { userId = dto.UserId }, userProjectPermission);
        }

        // 4) Sil
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var upp = await _context.UserProjectPermissions.FindAsync(id);
            if (upp == null)
                return NotFound();

            _context.UserProjectPermissions.Remove(upp);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
