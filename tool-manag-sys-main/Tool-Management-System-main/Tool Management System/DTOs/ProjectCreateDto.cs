namespace Tool_Management_System.Dtos
{
    public class ProjectCreateDto
    {
        public int AppId { get; set; }
        public string ProjectName { get; set; } = null!;
        public string? Description { get; set; }
    }
}
