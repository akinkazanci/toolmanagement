namespace Tool_Management_System.DTOs
{
    public class RoleResponseDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<RolePermissionDto> Permissions { get; set; } = new List<RolePermissionDto>();
        public int UserCount { get; set; }
    }

    public class CreateRoleDto
    {
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<int> PermissionIds { get; set; } = new List<int>();
    }

    public class UpdateRoleDto
    {
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<int> PermissionIds { get; set; } = new List<int>();
    }

    public class RolePermissionDto
    {
        public int RolePermissionId { get; set; }
        public int? RoleId { get; set; }
        public int? PermissionId { get; set; } // int? olarak değiştirin
        public string? PermissionName { get; set; } // nullable yapın
        public string? PermissionType { get; set; }
        public string? Description { get; set; }
        public string? AppName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // İlişkili veriler
        public string? RoleName { get; set; }
        public string? RoleDescription { get; set; }
        public string? PermissionDescription { get; set; }
    }

}
