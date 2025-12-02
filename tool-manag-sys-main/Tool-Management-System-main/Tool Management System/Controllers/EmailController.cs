using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Services;
using Tool_Management_System.DTOs;
using Tool_Management_System.Data;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;

        public EmailController(IEmailService emailService, ApplicationDbContext context)
        {
            _emailService = emailService;
            _context = context;
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestEmail()
        {
            var result = await _emailService.TestEmailConnectionAsync();

            if (result)
            {
                return Ok(new { message = "Test email sent successfully!", success = true });
            }

            return BadRequest(new { message = "Failed to send test email", success = false });
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] EmailDto emailDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _emailService.SendEmailAsync(emailDto);

            if (result)
            {
                return Ok(new { message = "Email sent successfully!", success = true });
            }

            return BadRequest(new { message = "Failed to send email", success = false });
        }

        [HttpPost("send-approval")]
        public async Task<IActionResult> SendApprovalEmail([FromBody] UserApprovalMailDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // DTO'yu zenginleştir: Applications ve AccessPermissions’i Access Management üzerinden doldur
            var userRoles = await _context.UserRoles
                .Include(ur => ur.App)
                .Include(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                .Where(ur => ur.UserId == dto.UserId && ur.App != null && ur.Role != null)
                .ToListAsync();

            dto.Applications = userRoles
                .Where(ur => ur.App != null)
                .Select(ur => ur.App!.AppName)
                .Distinct()
                .ToList();

            dto.AccessPermissions = userRoles
                .Where(ur => ur.App != null && ur.Role != null)
                .GroupBy(ur => ur.App!)
                .Select(g =>
                {
                    var permissionNames = g.SelectMany(ur => ur.Role!.RolePermissions
                            .Where(rp => rp.Permission != null)
                            .Select(rp => rp.Permission!.PermissionName))
                        .Distinct()
                        .ToList();

                    var joinedPerms = permissionNames.Any() ? string.Join(", ", permissionNames) : "N/A";
                    return $"{g.Key.AppName}: {joinedPerms}";
                })
                .ToList();

            var result = await _emailService.SendApprovalRequestEmailAsync(dto);

            if (result)
                return Ok(new { message = "Approval email sent successfully!", success = true });

            return BadRequest(new { message = "Failed to send approval email", success = false });
        }
    }
}
