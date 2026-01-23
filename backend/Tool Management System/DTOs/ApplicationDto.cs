namespace Tool_Management_System.DTOs
{
    public class ApplicationResponseDto
    {
        public int AppId { get; set; }
        public string AppName { get; set; } = string.Empty;
        public string? AppType { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int PermissionCount { get; set; }
        public int UserRoleCount { get; set; }
        public List<AppPermissionDto> Permissions { get; set; } = new List<AppPermissionDto>();
        public List<AppUserRoleDto> UserRoles { get; set; } = new List<AppUserRoleDto>();
    }

    public class CreateApplicationDto
    {
        public string AppName { get; set; } = string.Empty;
        public string? AppType { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateApplicationDto
    {
        public string AppName { get; set; } = string.Empty;
        public string? AppType { get; set; }
        public string? Description { get; set; }
    }

    public class AppPermissionDto
    {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string? PermissionType { get; set; }
        public string? Description { get; set; }
    }

    public class AppUserRoleDto
    {
        public int UserRoleId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime? AssignedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class ApplicationSummaryDto
    {
        public int AppId { get; set; }
        public string AppName { get; set; } = string.Empty;
        public string? AppType { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int PermissionCount { get; set; }
        public int UserRoleCount { get; set; }
    }
}
