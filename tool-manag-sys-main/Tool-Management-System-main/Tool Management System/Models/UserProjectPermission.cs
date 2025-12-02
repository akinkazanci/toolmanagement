using System;

namespace Tool_Management_System.Models;

public class UserProjectPermission
{
    public int UserProjectPermissionId { get; set; }
    public int UserId { get; set; }
    public int ProjectId { get; set; }
    public int PermissionId { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual Project Project { get; set; } = null!;
    public virtual Permission Permission { get; set; } = null!;
}
