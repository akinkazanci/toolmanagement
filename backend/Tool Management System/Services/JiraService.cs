using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Tool_Management_System.Models;

namespace Tool_Management_System.Services
{
    public class JiraService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public JiraService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;

            var baseUrl = _config["JiraSettings:BaseUrl"];
            var username = _config["JiraSettings:Username"];
            var apiToken = _config["JiraSettings:ApiToken"];

            _httpClient.BaseAddress = new Uri(baseUrl);
            var byteArray = Encoding.ASCII.GetBytes($"{username}:{apiToken}");
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
        }

        public async Task<List<JiraProjectDto>> GetProjectsAsync()
        {
            var response = await _httpClient.GetAsync("/rest/api/3/project");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var projects = JsonSerializer.Deserialize<List<JiraProjectDto>>(content, options);

            return projects ?? new List<JiraProjectDto>();
        }
    }

    // Jira’dan dönen json için basit DTO
    public class JiraProjectDto
    {
        public string Id { get; set; } = "";
        public string Key { get; set; } = "";
        public string Name { get; set; } = "";
    }
}
