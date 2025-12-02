namespace Tool_Management_System.DTOs
{
    // ✅ ApprovalToken eklendi
    public class UserApprovalDetailDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public List<string> Applications { get; set; } = new List<string>();

        // Yeni: E-posta için uygulama bazlı erişim yetkileri
        public List<string> AccessPermissions { get; set; } = new List<string>();

        // ✅ YENİ: ApprovalToken property'si
        public string ApprovalToken { get; set; } = string.Empty;

        // ✅ YENİ: Kullanıcıya tanımlı proje isimleri
        public List<string> Projects { get; set; } = new List<string>();
    }
}
