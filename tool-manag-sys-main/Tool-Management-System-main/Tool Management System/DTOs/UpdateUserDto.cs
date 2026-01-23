using System.ComponentModel.DataAnnotations;

namespace Tool_Management_System.DTOs
{
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
        public string Username { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? Email { get; set; }

        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string? FullName { get; set; }

        [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
        public string? Status { get; set; }

        [StringLength(50, ErrorMessage = "Department cannot exceed 50 characters")]
        public string? Department { get; set; }

        [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters")] // YENİ EKLENDİ
        public string? Location { get; set; }

        public List<int> RoleIds { get; set; } = new List<int>();
    }
}
