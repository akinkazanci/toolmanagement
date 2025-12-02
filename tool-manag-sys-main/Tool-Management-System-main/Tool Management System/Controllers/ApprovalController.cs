using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Tool_Management_System.Data;

namespace Tool_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApprovalController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ApprovalController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("approve")]
        public async Task<IActionResult> ApproveUser(int userId, string token, string action)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            // token doğrulaması yapılmalı (sen zaten ApprovalToken üretiyorsun)
            // örnek: if(user.ApprovalToken != token) return Unauthorized();

            if (action == "approve")
            {
                user.Status = "Approved";
            }
            else if (action == "reject")
            {
                user.Status = "Rejected";
            }

            await _db.SaveChangesAsync();

            return Ok(new { message = $"User {action}d successfully" });
        }
    }

}
