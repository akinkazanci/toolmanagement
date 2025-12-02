using Tool_Management_System.DTOs;

namespace Tool_Management_System.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(EmailDto emailDto);
        Task<bool> SendVerificationEmailAsync(EmailVerificationDto verificationDto);
        Task<bool> SendPasswordResetEmailAsync(PasswordResetDto resetDto);
        Task<bool> SendWelcomeEmailAsync(string email, string fullName);
        Task<bool> TestEmailConnectionAsync();
        Task<bool> SendPendingUsersNotificationAsync(PendingUserNotificationDto notificationDto);
        Task<bool> SendUserApprovalNotificationAsync(string userEmail, string userName, bool approved, string? rejectionReason = null);
        Task<bool> SendApprovalRequestEmailAsync(UserApprovalMailDto dto);
        Task<bool> SendMultiUserApprovalRequestAsync(MultiUserApprovalRequestDto dto);
    }
}
