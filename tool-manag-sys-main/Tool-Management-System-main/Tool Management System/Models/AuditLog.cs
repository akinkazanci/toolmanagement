using System;
using System.Collections.Generic;

namespace Tool_Management_System.Models;

public partial class AuditLog
{
    public int AuditId { get; set; }

    public string? ActionType { get; set; }

    public int? UserId { get; set; }

    public int? TargetId { get; set; }

    public string? ActionDetails { get; set; }

    public DateTime? Timestamp { get; set; }

    public virtual User? User { get; set; }
}
