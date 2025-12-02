namespace Tool_Management_System.Dtos
{
    public class ProjectReadDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = "";
        public string? Description { get; set; }
        public string? AppName { get; set; }
        public int AppId { get; set; }
    }
}
