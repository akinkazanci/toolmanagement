using System;
using System.Collections.Generic;

namespace Tool_Management_System.Models;

public class Project
{
    public int ProjectId { get; set; }
    public int AppId { get; set; }
    public string ProjectName { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Application App { get; set; } = null!;
    public virtual ICollection<UserProjectPermission> UserProjectPermissions { get; set; } = new List<UserProjectPermission>();
}
