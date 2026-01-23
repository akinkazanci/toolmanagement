namespace Tool_Management_System.DTOs
{
    public class EmailDto
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public bool IsHtml { get; set; } = true;
        public List<string>? Cc { get; set; }
        public List<string>? Bcc { get; set; }
    }

    public class EmailVerificationDto
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string VerificationToken { get; set; } = string.Empty;
        public string VerificationUrl { get; set; } = string.Empty;
    }

    public class PasswordResetDto
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string ResetToken { get; set; } = string.Empty;
        public string ResetUrl { get; set; } = string.Empty;
    }
}
