namespace Tool_Management_System.DTOs
{
    public class PendingUserNotificationDto
    {
        public List<UserApprovalDto> PendingUsers { get; set; } = new List<UserApprovalDto>();
        public string AdminEmail { get; set; } = string.Empty;
        public string AdminName { get; set; } = string.Empty;
        public string ApprovalBaseUrl { get; set; } = string.Empty;
    }
}
