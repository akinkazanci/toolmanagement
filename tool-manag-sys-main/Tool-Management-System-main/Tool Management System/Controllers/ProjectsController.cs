using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Dtos;
using Tool_Management_System.Models;
using Tool_Management_System.Services;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1) Tüm projeleri getir
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectReadDto>>> GetAll()
        {
            var projects = await _context.Projects
                .Include(p => p.App)
                .Select(p => new ProjectReadDto
                {
                    ProjectId = p.ProjectId,
                    ProjectName = p.ProjectName,
                    Description = p.Description,
                    AppName = p.App.AppName
                })
                .AsNoTracking()
                .ToListAsync();

            return projects;
        }

        // 2) Tek proje getir
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetById(int id)
        {
            var project = await _context.Projects
                .Include(p => p.App)
                .FirstOrDefaultAsync(p => p.ProjectId == id);

            if (project == null)
                return NotFound();

            return project;
        }

        // 3) Yeni proje ekle
        [HttpPost]
        public async Task<ActionResult<Project>> Create([FromBody] ProjectCreateDto dto)
        {
            var project = new Project
            {
                AppId = dto.AppId,
                ProjectName = dto.ProjectName,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = project.ProjectId }, project);
        }

        // 4) Güncelle
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProjectCreateDto dto)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            // Sadece değişen alanları güncelle
            project.ProjectName = dto.ProjectName;
            project.AppId = dto.AppId;
            project.Description = dto.Description;
            project.UpdatedAt = DateTime.UtcNow;

            _context.Entry(project).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Projects.Any(e => e.ProjectId == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // 5) Sil
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("import/jira")]
        public async Task<IActionResult> ImportFromJira([FromServices] JiraService jiraService)
        {
            // App tablosunda Jira’yı bul
            var jiraApp = await _context.Applications.FirstOrDefaultAsync(a => a.AppName == "Jira");
            if (jiraApp == null)
                return BadRequest("Jira uygulaması Applications tablosunda yok.");

            var jiraProjects = await jiraService.GetProjectsAsync();
            int addedCount = 0;

            foreach (var jp in jiraProjects)
            {
                bool exists = await _context.Projects.AnyAsync(p => p.ProjectName == jp.Name && p.AppId == jiraApp.AppId);
                if (!exists)
                {
                    var project = new Project
                    {
                        AppId = jiraApp.AppId,
                        ProjectName = jp.Name,
                        Description = $"Imported from Jira (Key: {jp.Key}, Id: {jp.Id})",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Projects.Add(project);
                    addedCount++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { imported = addedCount, total = jiraProjects.Count });
        }

        // GET: api/Projects/by-app/1
        [HttpGet("by-app/{appId}")]
        public async Task<ActionResult<IEnumerable<ProjectReadDto>>> GetByApp(int appId)
        {
            var projects = await _context.Projects
                .Where(p => p.AppId == appId)
                .Select(p => new ProjectReadDto
                {
                    ProjectId = p.ProjectId,
                    ProjectName = p.ProjectName,
                    Description = p.Description,
                    AppName = p.App.AppName
                })
                .ToListAsync();

            return projects;
        }
    }
}
