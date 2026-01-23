namespace Tool_Management_System.Dtos
{
    public class UserProjectPermissionCreateDto
    {
        public int UserId { get; set; }
        public int ProjectId { get; set; }
        public int PermissionId { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}
