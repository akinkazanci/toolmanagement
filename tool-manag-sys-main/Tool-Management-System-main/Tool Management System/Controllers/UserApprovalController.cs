using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.DTOs;
using Tool_Management_System.Models;
using Tool_Management_System.Services;
using System.Security.Cryptography;
using System.Text;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserApprovalController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        // ✅ Secret key (appsettings.json'dan al)
        private readonly string _secretKey;

        public UserApprovalController(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _secretKey = configuration["ApprovalTokenSecret"] ?? "YourSuperSecretKey123!@#";
        }

        // GET: api/UserApproval/pending
        [HttpGet("pending")]
        public async Task<ActionResult<List<UserApprovalDto>>> GetPendingUsers()
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.Status == UserStatus.Pending)
                    .ToListAsync();

                var pendingUsers = users.Select(u => new UserApprovalDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email ?? "",
                    FullName = u.FullName ?? "",
                    Department = u.Department,
                    Location = u.Location,
                    CreatedAt = u.CreatedAt ?? DateTime.UtcNow,
                    ApprovalToken = GenerateApprovalToken(u.UserId, u.Email ?? "", u.CreatedAt ?? DateTime.UtcNow)
                }).ToList();

                foreach (var pu in pendingUsers)
                {
                    var userRoles = await _context.UserRoles
                        .Include(ur => ur.App)
                        .Include(ur => ur.Role)
                            .ThenInclude(r => r.RolePermissions)
                                .ThenInclude(rp => rp.Permission)
                        .Where(ur => ur.UserId == pu.UserId && ur.App != null && ur.Role != null)
                        .ToListAsync();

                    var applications = userRoles
                        .Where(ur => ur.App != null)
                        .Select(ur => ur.App!.AppName)
                        .Distinct()
                        .ToList();

                    pu.Applications = applications;

                    var accessPermissions = userRoles
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

                    pu.AccessPermissions = accessPermissions;

                    // Yeni: Proje isimlerini ekle (Access Management -> UserProjectPermissions)
                    var userProjects = await _context.UserProjectPermissions
                        .Include(upp => upp.Project)
                        .Where(upp => upp.UserId == pu.UserId && upp.Project != null)
                        .Select(upp => upp.Project!.ProjectName)
                        .Distinct()
                        .ToListAsync();

                    pu.Projects = userProjects;
                }

                // Access Management verisini ekle: Applications ve AccessPermissions
                foreach (var pu in pendingUsers)
                {
                    var userRoles = await _context.UserRoles
                        .Include(ur => ur.App)
                        .Include(ur => ur.Role)
                            .ThenInclude(r => r.RolePermissions)
                                .ThenInclude(rp => rp.Permission)
                        .Where(ur => ur.UserId == pu.UserId && ur.App != null && ur.Role != null)
                        .ToListAsync();

                    var applications = userRoles
                        .Where(ur => ur.App != null)
                        .Select(ur => ur.App!.AppName)
                        .Distinct()
                        .ToList();

                    pu.Applications = applications;

                    var accessPermissions = userRoles
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

                    pu.AccessPermissions = accessPermissions;

                    // Yeni: Proje isimlerini ekle (Access Management -> UserProjectPermissions)
                    var userProjects = await _context.UserProjectPermissions
                        .Include(upp => upp.Project)
                        .Where(upp => upp.UserId == pu.UserId && upp.Project != null)
                        .Select(upp => upp.Project!.ProjectName)
                        .Distinct()
                        .ToListAsync();

                    pu.Projects = userProjects;
                }

                return Ok(pendingUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/UserApproval/approve
        [HttpGet("approve")]
        public async Task<IActionResult> ApproveUser([FromQuery] UserApprovalActionDto approvalDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(approvalDto.UserId);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                // ✅ Token doğrulama - CreatedAt ile birlikte kontrol et
                if (!ValidateApprovalToken(approvalDto.UserId, user.Email ?? "", user.CreatedAt ?? DateTime.UtcNow, approvalDto.Token))
                {
                    return BadRequest("Invalid or expired approval token");
                }

                if (user.Status != UserStatus.Pending)
                {
                    return BadRequest("User is not in pending status");
                }

                bool approved = approvalDto.Action.ToLower() == "approve";
                user.Status = approved ? UserStatus.Active : UserStatus.Rejected;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Send notification to user
                await _emailService.SendUserApprovalNotificationAsync(
                    user.Email ?? "",
                    user.FullName ?? "",
                    approved,
                    approvalDto.RejectionReason
                );

                var actionText = approved ? "approved" : "rejected";
                var html = GenerateApprovalResponsePage(user.FullName ?? "", actionText, approved);

                return Content(html, "text/html");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/UserApproval/approve-simple
        [HttpGet("approve-simple")]
        public async Task<IActionResult> ApproveUserSimple([FromQuery] int userId, [FromQuery] string action = "approve", [FromQuery] string? rejectionReason = null)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            if (user.Status != UserStatus.Pending)
            {
                return BadRequest("User is not in pending status");
            }

            bool approved = action.ToLower() == "approve";
            user.Status = approved ? UserStatus.Active : UserStatus.Rejected;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send notification to user
            await _emailService.SendUserApprovalNotificationAsync(
                user.Email ?? "",
                user.FullName ?? "",
                approved,
                rejectionReason
            );

            var actionText = approved ? "approved" : "rejected";
            var html = GenerateApprovalResponsePage(user.FullName ?? "", actionText, approved);

            return Content(html, "text/html");
        }

        // POST: api/UserApproval/notify-admin
        [HttpPost("notify-admin")]
        public async Task<IActionResult> NotifyAdminOfPendingUsers([FromBody] AdminNotificationRequestDto request)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(request.AdminEmail))
                {
                    var subject = string.IsNullOrWhiteSpace(request.EmailSubject) ? "Kullanıcı Erişim Onayı" : request.EmailSubject;
                    if (!string.IsNullOrWhiteSpace(request.EmailBodyHtml))
                    {
                        var emailDtoCustom = new EmailDto
                        {
                            To = request.AdminEmail,
                            Subject = subject,
                            Body = request.EmailBodyHtml,
                            IsHtml = true
                        };
                        var sent = await _emailService.SendEmailAsync(emailDtoCustom);
                        if (sent)
                        {
                            return Ok(new { message = "Custom notification sent successfully", success = true });
                        }
                        return BadRequest(new { message = "Failed to send custom notification email", success = false });
                    }
                    if (request.Entries != null && request.Entries.Any())
                    {
                        var body = BuildHtmlBody(request);
                        var emailDtoEntries = new EmailDto
                        {
                            To = request.AdminEmail,
                            Subject = subject,
                            Body = body,
                            IsHtml = true
                        };
                        var sent = await _emailService.SendEmailAsync(emailDtoEntries);
                        if (sent)
                        {
                            return Ok(new { message = "Notification sent successfully for provided entries", success = true });
                        }
                        return BadRequest(new { message = "Failed to send notification email for entries", success = false });
                    }
                }
                var users = await _context.Users
                    .Where(u => u.Status == UserStatus.Pending)
                    .ToListAsync();

                if (!users.Any())
                {
                    return Ok(new { message = "No pending users found", success = true });
                }

                var pendingUsers = users.Select(u => new UserApprovalDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email ?? "",
                    FullName = u.FullName ?? "",
                    Department = u.Department,
                    Location = u.Location,
                    CreatedAt = u.CreatedAt ?? DateTime.UtcNow,
                    ApprovalToken = GenerateApprovalToken(u.UserId, u.Email ?? "", u.CreatedAt ?? DateTime.UtcNow)
                }).ToList();

                var notificationDto = new PendingUserNotificationDto
                {
                    PendingUsers = pendingUsers,
                    AdminEmail = request.AdminEmail,
                    AdminName = request.AdminName,
                    ApprovalBaseUrl = request.ApprovalBaseUrl ?? $"{Request.Scheme}://{Request.Host}/api/UserApproval"
                };

                var result = await _emailService.SendPendingUsersNotificationAsync(notificationDto);

                if (result)
                {
                    return Ok(new { message = $"Notification sent successfully for {pendingUsers.Count} pending users", success = true });
                }

                return BadRequest(new { message = "Failed to send notification email", success = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/UserApproval/bulk-action
        [HttpPost("bulk-action")]
        public async Task<IActionResult> BulkApprovalAction([FromBody] BulkApprovalDto bulkDto)
        {
            var userIds = bulkDto.UserActions.Select(ua => ua.UserId).ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.UserId) && u.Status == UserStatus.Pending)
                .ToListAsync();

            if (!users.Any())
            {
                return BadRequest("No pending users found for the provided IDs");
            }

            foreach (var userAction in bulkDto.UserActions)
            {
                var user = users.FirstOrDefault(u => u.UserId == userAction.UserId);
                if (user != null)
                {
                    bool approved = userAction.Action.ToLower() == "approve";
                    user.Status = approved ? UserStatus.Active : UserStatus.Rejected;
                    user.UpdatedAt = DateTime.UtcNow;

                    // Send notification to user
                    await _emailService.SendUserApprovalNotificationAsync(
                        user.Email ?? "",
                        user.FullName ?? "",
                        approved,
                        userAction.RejectionReason
                    );
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Bulk action completed for {users.Count} users", success = true });
        }

        [HttpPost("send-multi-approval")]
        public async Task<IActionResult> SendMultiApproval([FromBody] MultiUserApprovalRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // ✅ Token'ları oluştur
            var userIds = dto.Users.Select(u => u.UserId).ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.UserId))
                .ToListAsync();

            foreach (var userDto in dto.Users)
            {
                var user = users.FirstOrDefault(u => u.UserId == userDto.UserId);
                if (user != null)
                {
                    userDto.ApprovalToken = GenerateApprovalToken(user.UserId, user.Email ?? "", user.CreatedAt ?? DateTime.UtcNow);

                    // Uygulamalar ve erişim yetkilerini Access Management üzerinden doldur
                    var userRoles = await _context.UserRoles
                        .Include(ur => ur.App)
                        .Include(ur => ur.Role)
                            .ThenInclude(r => r.RolePermissions)
                                .ThenInclude(rp => rp.Permission)
                        .Where(ur => ur.UserId == userDto.UserId && ur.App != null && ur.Role != null)
                        .ToListAsync();

                    // Applications: kullanıcıya atanmış uygulama adları
                    var applications = userRoles
                        .Where(ur => ur.App != null)
                        .Select(ur => ur.App!.AppName)
                        .Distinct()
                        .ToList();

                    userDto.Applications = applications;

                    // AccessPermissions: uygulama bazında izin adları (Permission.PermissionName)
                    var accessPermissions = userRoles
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

                    userDto.AccessPermissions = accessPermissions;

                    // ✅ Projeler: UserProjectPermissions üzerinden proje isimlerini topla
                    var userProjects = await _context.UserProjectPermissions
                        .Include(upp => upp.Project)
                        .Where(upp => upp.UserId == userDto.UserId && upp.Project != null)
                        .Select(upp => upp.Project!.ProjectName)
                        .Distinct()
                        .ToListAsync();

                    userDto.Projects = userProjects;
                }
            }

            var result = await _emailService.SendMultiUserApprovalRequestAsync(dto);

            if (result)
                return Ok(new { message = "Multi-user approval email sent successfully!" });

            return BadRequest(new { message = "Failed to send approval email" });
        }

        // ✅ YENİ: Token oluştur (UserId + Email + CreatedAt + Secret Key ile HMAC)
        private string GenerateApprovalToken(int userId, string email, DateTime createdAt)
        {
            // ✅ createdAt'ı sadece saniyeye kadar normalize et (milisaniyeyi sıfırla)
            createdAt = new DateTime(createdAt.Year, createdAt.Month, createdAt.Day, createdAt.Hour, createdAt.Minute, createdAt.Second, DateTimeKind.Utc);

            var data = $"{userId}:{email}:{createdAt:yyyy-MM-dd HH:mm:ss}";

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secretKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));

            return Convert.ToBase64String(hash)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
        }

        // Token doğrulama
        private bool ValidateApprovalToken(int userId, string email, DateTime createdAt, string token)
        {
            try
            {
                // ✅ normalize et
                createdAt = new DateTime(createdAt.Year, createdAt.Month, createdAt.Day, createdAt.Hour, createdAt.Minute, createdAt.Second, DateTimeKind.Utc);

                var expectedToken = GenerateApprovalToken(userId, email, createdAt);
                return expectedToken == token;
            }
            catch
            {
                return false;
            }
        }

        private string GenerateApprovalResponsePage(string userName, string action, bool approved)
        {
            var color = approved ? "#28a745" : "#dc3545";
            var icon = approved ? "✅" : "❌";
            var message = approved ? "has been approved successfully!" : "application has been processed.";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>User {action}</title>
    <style>
        body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa; }}
        .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .icon {{ font-size: 64px; margin-bottom: 20px; }}
        .title {{ color: {color}; margin-bottom: 20px; }}
        .message {{ font-size: 18px; color: #666; margin-bottom: 30px; }}
        .button {{ display: inline-block; padding: 10px 20px; background-color: {color}; color: white; text-decoration: none; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='icon'>{icon}</div>
        <h1 class='title'>User {action.ToUpper()}</h1>
        <p class='message'>{userName} {message}</p>
        <p>The user has been notified via email.</p>
        <a href='#' class='button' onclick='window.close()'>Close</a>
    </div>
</body>
</html>";
        }
        private string BuildHtmlBody(AdminNotificationRequestDto req)
        {
            var sb = new StringBuilder();
            sb.Append("<div style=\"font-family:Arial,sans-serif;font-size:14px;color:#111\">");
            sb.Append("<p>Seçili kullanıcılar için erişim bilgileri:</p>");
            sb.Append("<table style=\"border-collapse:collapse;width:100%\">");
            sb.Append("<thead><tr>");
            sb.Append("<th style=\"border:1px solid #ddd;padding:8px;text-align:left\">Kullanıcı</th>");
            sb.Append("<th style=\"border:1px solid #ddd;padding:8px;text-align:left\">Departman</th>");
            sb.Append("<th style=\"border:1px solid #ddd;padding:8px;text-align:left\">Lokasyon</th>");
            sb.Append("<th style=\"border:1px solid #ddd;padding:8px;text-align:left\">Durum</th>");
            sb.Append("<th style=\"border:1px solid #ddd;padding:8px;text-align:left\">Uygulama</th>");
            sb.Append("<th style=\"border:1px solid #ddd;padding:8px;text-align:left\">Projeler</th>");
            sb.Append("<th style=\"border:1px solid #ddd;padding:8px;text-align:left\">Erişim Yetkisi</th>");
            sb.Append("</tr></thead><tbody>");
            foreach (var r in req.Entries ?? new List<ApprovalEmailEntryDto>())
            {
                var rolesText = (r.Roles != null && r.Roles.Any()) ? string.Join(", ", r.Roles) : "-";
                var statusText = string.IsNullOrWhiteSpace(r.Status) ? "-" : r.Status.ToLower();
                var projectsText = (r.Projects != null && r.Projects.Any()) ? string.Join(", ", r.Projects) : "-";
                sb.Append("<tr>");
                sb.Append($"<td style=\"border:1px solid #ddd;padding:8px\">{r.FullName ?? "-"}</td>");
                sb.Append($"<td style=\"border:1px solid #ddd;padding:8px\">{r.Department ?? "-"}</td>");
                sb.Append($"<td style=\"border:1px solid #ddd;padding:8px\">{r.Location ?? "-"}</td>");
                sb.Append($"<td style=\"border:1px solid #ddd;padding:8px\">{statusText}</td>");
                sb.Append($"<td style=\"border:1px solid #ddd;padding:8px\">{r.AppName ?? "-"}</td>");
                sb.Append($"<td style=\"border:1px solid #ddd;padding:8px\">{projectsText}</td>");
                sb.Append($"<td style=\"border:1px solid #ddd;padding:8px\">{rolesText}</td>");
                sb.Append("</tr>");
            }
            sb.Append("</tbody></table></div>");
            return sb.ToString();
        }
    }

        public class AdminNotificationRequestDto
        {
            public string AdminEmail { get; set; } = string.Empty;
            public string AdminName { get; set; } = string.Empty;
            public string? ApprovalBaseUrl { get; set; }
            public string? EmailSubject { get; set; }
            public string? EmailBodyHtml { get; set; }
            public List<ApprovalEmailEntryDto>? Entries { get; set; }
        }

        public class BulkApprovalDto
        {
            public List<UserApprovalActionDto> UserActions { get; set; } = new List<UserApprovalActionDto>();
        }


        public class ApprovalEmailEntryDto
        {
            public int UserId { get; set; }
            public string? FullName { get; set; }
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? Department { get; set; }
            public string? Location { get; set; }
            public string? Status { get; set; }
            public string? CreatedAt { get; set; }
            public int AppId { get; set; }
            public string? AppName { get; set; }
            public List<string>? Roles { get; set; }
            public List<string>? Projects { get; set; }
        }
}
