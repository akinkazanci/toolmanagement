namespace Tool_Management_System.DTOs
{
    public class UserApprovalMailDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string ApprovalToken { get; set; } = null!;
        public string ApprovalBaseUrl { get; set; } = null!;

        // Yeni: Mailde gösterilecek uygulamalar ve erişim yetkileri
        public List<string> Applications { get; set; } = new List<string>();
        public List<string> AccessPermissions { get; set; } = new List<string>();
    }
}
