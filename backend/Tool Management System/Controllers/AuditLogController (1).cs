using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Models;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuditLogController(ApplicationDbContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogs()
        {
            return await _context.AuditLogs
                .Include(a => a.User)
                .ToListAsync();
        }

        
        [HttpGet("{id}")]
        public async Task<ActionResult<AuditLog>> GetAuditLog(int id)
        {
            var auditLog = await _context.AuditLogs
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AuditId == id);

            if (auditLog == null)
            {
                return NotFound();
            }

            return auditLog;
        }

        
        [HttpPost]
        public async Task<ActionResult<AuditLog>> PostAuditLog(AuditLog auditLog)
        {
            
            auditLog.Timestamp = DateTime.Now;
            
            
            if (auditLog.UserId != null && !_context.Users.Any(u => u.UserId == auditLog.UserId))
            {
                return BadRequest("Geçersiz UserId");
            }

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAuditLog), new { id = auditLog.AuditId }, auditLog);
        }

        
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAuditLog(int id, AuditLog auditLog)
        {
            if (id != auditLog.AuditId)
            {
                return BadRequest();
            }

            
            auditLog.Timestamp = DateTime.Now;

            
            if (auditLog.UserId != null && !_context.Users.Any(u => u.UserId == auditLog.UserId))
            {
                return BadRequest("Geçersiz UserId");
            }

            _context.Entry(auditLog).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AuditLogExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAuditLog(int id)
        {
            var auditLog = await _context.AuditLogs.FindAsync(id);
            if (auditLog == null)
            {
                return NotFound();
            }

            _context.AuditLogs.Remove(auditLog);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AuditLogExists(int id)
        {
            return _context.AuditLogs.Any(e => e.AuditId == id);
        }
    }
}