// DTOs/ApplicationUserPermissionDtos.cs
namespace Tool_Management_System.DTOs
{
    // Bir uygulamadaki kullanıcı detayları
    public class AppUserDetailDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<UserRoleInAppDto> Roles { get; set; } = new List<UserRoleInAppDto>();
    }

    // Bir uygulamadaki kullanıcının rolü ve izinleri
    public class UserRoleInAppDto
    {
        public int UserRoleId { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime? AssignedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
        public List<PermissionSummaryDto> Permissions { get; set; } = new List<PermissionSummaryDto>();
    }

    // İzin özeti
    public class PermissionSummaryDto
    {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string? PermissionType { get; set; }
        public string? Description { get; set; }
    }

    // Uygulama izin detayları
    public class AppPermissionDetailDto
    {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string? PermissionType { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int RoleCount { get; set; }
        public int UserCount { get; set; }
        public List<RoleSummaryDto> AssignedRoles { get; set; } = new List<RoleSummaryDto>();
    }

    // Rol özeti
    public class RoleSummaryDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int UserCount { get; set; }
    }

    // Kullanıcıya uygulama rolü atama
    public class AssignUserToAppDto
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    // Kullanıcının tüm uygulama izinleri
    public class UserAppPermissionDto
    {
        public int AppId { get; set; }
        public string AppName { get; set; } = string.Empty;
        public string? AppType { get; set; }
        public string? Description { get; set; }
        public List<UserRoleInAppDto> UserRoles { get; set; } = new List<UserRoleInAppDto>();
        public int TotalPermissions => UserRoles.SelectMany(r => r.Permissions).Distinct().Count();
        public bool HasActiveRoles => UserRoles.Any(r => !r.IsExpired);
    }

    // Uygulama kullanıcı istatistikleri
    public class AppUserStatsDto
    {
        public int AppId { get; set; }
        public string AppName { get; set; } = string.Empty;
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int ExpiredUsers { get; set; }
        public int TotalRoles { get; set; }
        public int TotalPermissions { get; set; }
        public List<RoleUserCountDto> RoleStats { get; set; } = new List<RoleUserCountDto>();
    }

    public class RoleUserCountDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public int UserCount { get; set; }
        public int ActiveUserCount { get; set; }
    }
}
