namespace Tool_Management_System.DTOs
{
    public class UserApprovalDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string? Location { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ApprovalToken { get; set; } = string.Empty;

        // Access Management verisi: uygulamalar ve uygulama bazlı izinler
        public List<string> Applications { get; set; } = new List<string>();
        public List<string> AccessPermissions { get; set; } = new List<string>();
        // Yeni: Kullanıcıya atanmış proje isimleri (erişim yönetimi üzerinden)
        public List<string> Projects { get; set; } = new List<string>();
    }
}
