using System;
using System.Collections.Generic;

namespace Tool_Management_System.Models;

public partial class Application
{
    public int AppId { get; set; }

    public string AppName { get; set; } = null!;

    public string? AppType { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Permission> Permissions { get; set; } = new List<Permission>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
}
