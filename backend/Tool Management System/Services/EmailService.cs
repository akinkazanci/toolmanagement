using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Options;
using Tool_Management_System.DTOs;
using Tool_Management_System.Models;

namespace Tool_Management_System.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailConfiguration _emailConfig;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailConfiguration> emailConfig, ILogger<EmailService> logger)
        {
            _emailConfig = emailConfig.Value;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(EmailDto emailDto)
        {
            try
            {
                using var client = CreateSmtpClient();
                using var mailMessage = CreateMailMessage(emailDto);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation($"Email sent successfully to {emailDto.To}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {emailDto.To}");
                return false;
            }
        }

        public async Task<bool> SendVerificationEmailAsync(EmailVerificationDto verificationDto)
        {
            var emailDto = new EmailDto
            {
                To = verificationDto.Email,
                Subject = "Email Verification - Tool Management System",
                Body = GenerateVerificationEmailTemplate(verificationDto),
                IsHtml = true
            };

            return await SendEmailAsync(emailDto);
        }

        public async Task<bool> SendPasswordResetEmailAsync(PasswordResetDto resetDto)
        {
            var emailDto = new EmailDto
            {
                To = resetDto.Email,
                Subject = "Password Reset - Tool Management System",
                Body = GeneratePasswordResetEmailTemplate(resetDto),
                IsHtml = true
            };

            return await SendEmailAsync(emailDto);
        }

        public async Task<bool> SendWelcomeEmailAsync(string email, string fullName)
        {
            var emailDto = new EmailDto
            {
                To = email,
                Subject = "Welcome to Tool Management System",
                Body = GenerateWelcomeEmailTemplate(fullName),
                IsHtml = true
            };

            return await SendEmailAsync(emailDto);
        }

        public async Task<bool> TestEmailConnectionAsync()
        {
            try
            {
                using var client = CreateSmtpClient();

                var testEmail = new EmailDto
                {
                    To = _emailConfig.SenderEmail,
                    Subject = "SMTP Test - Tool Management System",
                    Body = "<h2>SMTP Connection Test</h2><p>If you receive this email, SMTP configuration is working correctly!</p>",
                    IsHtml = true
                };

                using var mailMessage = CreateMailMessage(testEmail);
                await client.SendMailAsync(mailMessage);

                _logger.LogInformation("SMTP test email sent successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMTP test failed");
                return false;
            }
        }

        // IEmailService.cs interface'ine de bu metodları ekleyin
        public async Task<bool> SendPendingUsersNotificationAsync(PendingUserNotificationDto notificationDto)
        {
            var emailDto = new EmailDto
            {
                To = notificationDto.AdminEmail,
                Subject = $"User Approval Required - {notificationDto.PendingUsers.Count} Pending Users",
                Body = GeneratePendingUsersEmailTemplate(notificationDto),
                IsHtml = true
            };

            return await SendEmailAsync(emailDto);
        }

        public async Task<bool> SendUserApprovalNotificationAsync(string userEmail, string userName, bool approved, string? rejectionReason = null)
        {
            var subject = approved ? "Account Approved - Tool Management System" : "Account Application Update - Tool Management System";
            var body = approved
                ? GenerateUserApprovedEmailTemplate(userName)
                : GenerateUserRejectedEmailTemplate(userName, rejectionReason);

            var emailDto = new EmailDto
            {
                To = userEmail,
                Subject = subject,
                Body = body,
                IsHtml = true
            };

            return await SendEmailAsync(emailDto);
        }

        public async Task<bool> SendApprovalRequestEmailAsync(UserApprovalMailDto dto)
        {
            var emailDto = new EmailDto
            {
                To = dto.Email,
                Subject = "Account Approval Request - Tool Management System",
                Body = GenerateApprovalRequestEmailTemplate(dto),
                IsHtml = true
            };

            return await SendEmailAsync(emailDto);
        }

        public async Task<bool> SendMultiUserApprovalRequestAsync(MultiUserApprovalRequestDto dto)
        {
            try
            {
                var emailDto = new EmailDto
                {
                    To = dto.AdminEmail,
                    Subject = "Multi-User Approval Request - Tool Management System",
                    Body = GenerateMultiUserApprovalEmailTemplate(dto),
                    IsHtml = true
                };

                return await SendEmailAsync(emailDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send multi-user approval request email.");
                return false;
            }
        }

        private string GenerateMultiUserApprovalEmailTemplate(MultiUserApprovalRequestDto dto)
        {
            var sb = new StringBuilder();

            sb.AppendLine("<!DOCTYPE html>");
            sb.AppendLine("<html><head><meta charset='utf-8'><title>Multi-User Approval</title></head><body>");
            sb.AppendLine($"<h2>Hello {dto.AdminName},</h2>");
            sb.AppendLine("<p>The following users require approval:</p>");
            sb.AppendLine("<table border='1' cellpadding='8' cellspacing='0' style='border-collapse: collapse; width:100%;'>");
            sb.AppendLine("<thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Location</th><th>Yetkiler</th><th>Applications</th><th>Projects</th><th>Actions</th></tr></thead><tbody>");

            foreach (var user in dto.Users)
            {
                var apps = user.Applications != null && user.Applications.Any()
                    ? string.Join(", ", user.Applications)
                    : "N/A";
                var perms = user.AccessPermissions != null && user.AccessPermissions.Any()
                    ? string.Join("<br/>", user.AccessPermissions)
                    : "N/A";
                var projects = user.Projects != null && user.Projects.Any()
                    ? string.Join(", ", user.Projects)
                    : "N/A";

                sb.AppendLine("<tr>");
                sb.AppendLine($"<td>{user.FullName}</td>");
                sb.AppendLine($"<td>{user.Email}</td>");
                sb.AppendLine($"<td>{user.Department}</td>");
                sb.AppendLine($"<td>{user.Location}</td>");
                // Yeni istenen düzen: 'Yetkiler' sütunu izinleri (perms), 'Applications' sütunu uygulamaları (apps), 'Projects' sütunu proje isimleri
                sb.AppendLine($"<td>{perms}</td>");
                sb.AppendLine($"<td>{apps}</td>");
                sb.AppendLine($"<td>{projects}</td>");
                sb.AppendLine("<td>");
                sb.AppendLine(
                    $"<a href='{_emailConfig.BaseUrl}/api/UserApproval/approve?userId={user.UserId}&token={user.ApprovalToken}&action=approve' " +
                    "style='background-color: #28a745; color: white; padding: 6px 10px; text-decoration: none; margin-right: 5px;'>Approve</a>");
                sb.AppendLine(
                    $"<a href='{_emailConfig.BaseUrl}/api/UserApproval/approve?userId={user.UserId}&token={user.ApprovalToken}&action=reject' " +
                    "style='background-color: #dc3545; color: white; padding: 6px 10px; text-decoration: none;'>Reject</a>");
                sb.AppendLine("</td>");
                sb.AppendLine("</tr>");
            }

            sb.AppendLine("</tbody></table>");
            sb.AppendLine("<p>Please review and take action.</p>");
            sb.AppendLine("</body></html>");

            return sb.ToString();
        }


        private string GenerateApprovalRequestEmailTemplate(UserApprovalMailDto dto)
        {
            var appsList = dto.Applications != null && dto.Applications.Any()
                ? string.Join(", ", dto.Applications)
                : "N/A";

            var permsList = dto.AccessPermissions != null && dto.AccessPermissions.Any()
                ? string.Join("<br/>", dto.AccessPermissions)
                : "N/A";

            return $@"
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='utf-8'>
        <title>Account Approval Request</title>
    </head>
    <body>
        <h2>Hello {dto.FullName},</h2>
        <p>Your account is pending approval. Please confirm your registration:</p>
        <a href='{_emailConfig.BaseUrl}/api/UserApproval/approve?userId={dto.UserId}&token={dto.ApprovalToken}&action=approve' 
           style='background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none;'>Approve</a>
        <a href='{_emailConfig.BaseUrl}/api/UserApproval/approve?userId={dto.UserId}&token={dto.ApprovalToken}&action=reject' 
           style='background-color: #dc3545; color: white; padding: 10px 15px; text-decoration: none; margin-left:10px;'>Reject</a>

        <hr style='margin:20px 0;' />
        <h3>Applications</h3>
        <p>{appsList}</p>
        <h3>Yetkiler</h3>
        <p>{permsList}</p>
    </body>
    </html>";
        }

        // Email template metodları
        private string GeneratePendingUsersEmailTemplate(PendingUserNotificationDto notificationDto)
        {
            var userRows = string.Join("", notificationDto.PendingUsers.Select(user =>
            {
                var apps = (user.Applications != null && user.Applications.Any())
                    ? string.Join(", ", user.Applications)
                    : "N/A";
                var perms = (user.AccessPermissions != null && user.AccessPermissions.Any())
                    ? string.Join("<br/>", user.AccessPermissions)
                    : "N/A";
                var projects = (user.Projects != null && user.Projects.Any())
                    ? string.Join(", ", user.Projects)
                    : "N/A";
            
                return $@"
                    <tr>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{user.FullName}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{user.Username}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{user.Email}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{user.Department ?? "N/A"}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{user.Location ?? "N/A"}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{perms}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{apps}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{projects}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{user.CreatedAt.ToString("dd/MM/yyyy HH:mm")}</td>
                        <td style='padding: 10px; border-bottom: 1px solid #ddd;'>
                            <a href='{_emailConfig.BaseUrl}/api/UserApproval/approve?userId={user.UserId}&token={user.ApprovalToken}&action=approve'
                               style='background-color: #28a745; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px; margin-right: 5px;'>Approve</a>
                            <a href='{_emailConfig.BaseUrl}/api/UserApproval/approve?userId={user.UserId}&token={user.ApprovalToken}&action=reject'
                               style='background-color: #dc3545; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;'>Reject</a>
                        </td>
                    </tr>";
            }));
        
            var html = $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>Pending User Approvals</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 900px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #ffc107; color: #212529; padding: 20px; text-align: center; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ padding: 10px; border-bottom: 1px solid #ddd; text-align: left; vertical-align: top; }}
                th {{ background-color: #f1f1f1; }}
                .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>{notificationDto.AdminName}, Onay Bekleyen Kullanıcılar</h2>
                </div>
                <div class='content'>
                    <p>Aşağıdaki kullanıcılar için onay gerekmektedir:</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Departman</th>
                                <th>Lokasyon</th>
                                <th>Yetkiler</th>
                                <th>Uygulama</th>
                                <th>Projeler</th>
                                <th>Oluşturulma</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userRows}
                        </tbody>
                    </table>
                    <div style='margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 5px;'>
                        <h4>📝 Talimatlar:</h4>
                        <ul>
                            <li><strong>Onayla</strong> ile kullanıcı hesabını etkinleştirirsiniz</li>
                            <li><strong>Reddet</strong> ile kayıt talebini reddedersiniz</li>
                            <li>Kullanıcılara kararınız otomatik olarak e-posta ile bildirilir</li>
                        </ul>
                    </div>
                </div>
                <div class='footer'>
                    <p>&copy; 2024 Tool Management System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
        
            return html;
        }

        private string GenerateUserApprovedEmailTemplate(string userName)
        {
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <title>Account Approved</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: #f8f9fa; }}
                    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                    .success-icon {{ font-size: 48px; text-align: center; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>🎉 Account Approved!</h1>
                    </div>
                    <div class='content'>
                        <div class='success-icon'>✅</div>
                        <h2>Hello {userName},</h2>
                        <p>Great news! Your Tool Management System account has been <strong>approved</strong> by our administrator.</p>
                        <p>You can now access all features of the system:</p>
                        <ul>
                            <li>✅ Full system access</li>
                            <li>✅ Tool management capabilities</li>
                            <li>✅ Reporting features</li>
                            <li>✅ Team collaboration tools</li>
                        </ul>
                        <p>You can now log in to your account using your credentials.</p>
                        <p>Welcome to Tool Management System!</p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2024 Tool Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";
        }

        private string GenerateUserRejectedEmailTemplate(string userName, string? rejectionReason)
        {
            var reasonSection = !string.IsNullOrEmpty(rejectionReason)
                ? $"<p><strong>Reason:</strong> {rejectionReason}</p>"
                : "";

            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <title>Account Application Update</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #dc3545; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: #f8f9fa; }}
                    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Account Application Update</h1>
                    </div>
                    <div class='content'>
                        <h2>Hello {userName},</h2>
                        <p>Thank you for your interest in Tool Management System.</p>
                        <p>Unfortunately, your account application has not been approved at this time.</p>
                        {reasonSection}
                        <p>If you believe this is an error or would like to reapply, please contact our support team.</p>
                        <p>Thank you for your understanding.</p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2024 Tool Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";
        }

        private SmtpClient CreateSmtpClient()
        {
            var client = new SmtpClient(_emailConfig.SmtpServer, _emailConfig.SmtpPort)
            {
                Credentials = new NetworkCredential(_emailConfig.Username, _emailConfig.Password),
                EnableSsl = _emailConfig.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            return client;
        }

        private MailMessage CreateMailMessage(EmailDto emailDto)
        {
            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailConfig.SenderEmail, _emailConfig.SenderName),
                Subject = emailDto.Subject,
                Body = emailDto.Body,
                IsBodyHtml = emailDto.IsHtml
            };

            mailMessage.To.Add(emailDto.To);

            // Add CC recipients
            if (emailDto.Cc != null && emailDto.Cc.Any())
            {
                foreach (var cc in emailDto.Cc)
                {
                    mailMessage.CC.Add(cc);
                }
            }

            // Add BCC recipients
            if (emailDto.Bcc != null && emailDto.Bcc.Any())
            {
                foreach (var bcc in emailDto.Bcc)
                {
                    mailMessage.Bcc.Add(bcc);
                }
            }

            return mailMessage;
        }

        private string GenerateVerificationEmailTemplate(EmailVerificationDto verificationDto)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Email Verification</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f8f9fa; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Tool Management System</h1>
        </div>
        <div class='content'>
            <h2>Hello {verificationDto.FullName},</h2>
            <p>Welcome to Tool Management System! Please verify your email address to complete your registration.</p>
            <p>Click the button below to verify your email:</p>
            <a href='{verificationDto.VerificationUrl}' class='button'>Verify Email Address</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href='{verificationDto.VerificationUrl}'>{verificationDto.VerificationUrl}</a></p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class='footer'>
            <p>&copy; 2024 Tool Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GeneratePasswordResetEmailTemplate(PasswordResetDto resetDto)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Password Reset</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #dc3545; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f8f9fa; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Password Reset Request</h1>
        </div>
        <div class='content'>
            <h2>Hello {resetDto.FullName},</h2>
            <p>We received a request to reset your password for your Tool Management System account.</p>
            <p>Click the button below to reset your password:</p>
            <a href='{resetDto.ResetUrl}' class='button'>Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href='{resetDto.ResetUrl}'>{resetDto.ResetUrl}</a></p>
            <p>This reset link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class='footer'>
            <p>&copy; 2024 Tool Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateWelcomeEmailTemplate(string fullName)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Welcome</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f8f9fa; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Welcome to Tool Management System!</h1>
        </div>
        <div class='content'>
            <h2>Hello {fullName},</h2>
            <p>Welcome to Tool Management System! Your account has been successfully created and verified.</p>
            <p>You can now access all the features of our platform:</p>
            <ul>
                <li>Manage tools and equipment</li>
                <li>Track usage and maintenance</li>
                <li>Generate reports</li>
                <li>Collaborate with your team</li>
            </ul>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <p>Thank you for joining us!</p>
        </div>
        <div class='footer'>
            <p>&copy; 2024 Tool Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}