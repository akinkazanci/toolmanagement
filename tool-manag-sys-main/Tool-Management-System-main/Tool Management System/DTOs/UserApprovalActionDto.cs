namespace Tool_Management_System.DTOs
{
    public class UserApprovalActionDto
    {
        public int UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // "approve" or "reject"
        public string? RejectionReason { get; set; }
    }
}
