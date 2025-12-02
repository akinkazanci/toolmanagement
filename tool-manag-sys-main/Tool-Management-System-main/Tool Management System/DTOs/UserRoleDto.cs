namespace Tool_Management_System.DTOs
{
    public class UserRoleResponseDto
    {
        public int UserRoleId { get; set; }
        public int? UserId { get; set; }   // ❗ int? olacak
        public string Username { get; set; } = string.Empty;
        public int? RoleId { get; set; }   // ❗ int? olacak
        public string RoleName { get; set; } = string.Empty;
        public int? AppId { get; set; }
        public string? AppName { get; set; }
        public DateTime? AssignedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ProjectDto> Projects { get; set; } = new();
    }

    public class CreateUserRoleDto
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public int? AppId { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public List<int> ProjectIds { get; set; } = new();
    }

    public class UpdateUserRoleDto
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public int? AppId { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public List<int> ProjectIds { get; set; } = new();
    }

    public class ProjectDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; }
    }
}
