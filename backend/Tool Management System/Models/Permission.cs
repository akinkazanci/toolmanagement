using System;
using System.Collections.Generic;

namespace Tool_Management_System.Models;

public partial class Permission
{
    public int PermissionId { get; set; }

    public int? AppId { get; set; }

    public string PermissionName { get; set; } = null!;

    public string? PermissionType { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Application? App { get; set; }

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public virtual ICollection<UserProjectPermission> UserProjectPermissions { get; set; } = new List<UserProjectPermission>();
}
