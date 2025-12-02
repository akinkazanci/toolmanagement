namespace Tool_Management_System.DTOs
{
    public class MultiUserApprovalRequestDto
    {
        public string AdminEmail { get; set; }
        public string AdminName { get; set; }
        public string ApprovalBaseUrl { get; set; }

        public List<UserApprovalDetailDto> Users { get; set; }
    }
}
