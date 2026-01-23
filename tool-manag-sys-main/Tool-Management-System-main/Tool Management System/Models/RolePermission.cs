using System;
using System.Collections.Generic;

namespace Tool_Management_System.Models;

public partial class RolePermission
{
    public int RolePermissionId { get; set; }

    public int? RoleId { get; set; }

    public int? PermissionId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Permission? Permission { get; set; }

    public virtual Role? Role { get; set; }
}
