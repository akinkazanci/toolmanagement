using System;
using System.Collections.Generic;

namespace Tool_Management_System.Models;

public partial class UserRole
{
    public int UserRoleId { get; set; }

    public int? UserId { get; set; }

    public int? RoleId { get; set; }

    public int? AppId { get; set; }

    public DateTime? AssignedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Application? App { get; set; }

    public virtual Role? Role { get; set; }

    public virtual User? User { get; set; }
}
