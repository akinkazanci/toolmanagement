using Microsoft.EntityFrameworkCore;
using Tool_Management_System.Data;
using Tool_Management_System.Services;
using Tool_Management_System.Models;
using Microsoft.OpenApi.Models;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// 🔧 CONFIGURATION
// ============================================

var enableSwagger = builder.Configuration.GetValue<bool>("SwaggerSettings:EnableSwagger");
var isDevelopment = builder.Environment.IsDevelopment();

// ============================================
// 📦 SERVICES
// ============================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Email Configuration
builder.Services.Configure<EmailConfiguration>(options =>
{
    var emailSettings = builder.Configuration.GetSection("EmailSettings");
    options.SmtpServer = emailSettings["SmtpServer"] ?? "";
    options.SmtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
    options.SenderEmail = emailSettings["SenderEmail"] ?? "";
    options.SenderName = emailSettings["SenderName"] ?? "";
    options.Username = emailSettings["Username"] ?? "";
    options.Password = emailSettings["Password"] ?? "";
    options.EnableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true");
    options.BaseUrl = emailSettings["BaseUrl"] ?? "";
});

// Custom Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ============================================
// 🌐 CORS - Environment-based
// ============================================

builder.Services.AddCors(options =>
{
    if (isDevelopment)
    {
        options.AddPolicy("CorsPolicy", policy =>
        {
            policy.WithOrigins(
                    "http://localhost:3000",
                    "https://localhost:3000",
                    "https://localhost:7295",
                    "http://localhost:5065"
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    }
    else
    {
        // Production CORS - Config'ten oku
        var allowedOrigins = builder.Configuration
            .GetSection("CorsSettings:AllowedOrigins")
            .Get<string[]>() ?? Array.Empty<string>();

        options.AddPolicy("CorsPolicy", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    }
});

// ============================================
// 🔐 JWT Authentication
// ============================================

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException("JWT Key must be at least 32 characters long. Check your configuration.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Jira Service
builder.Services.AddHttpClient<JiraService>();

// ============================================
// 📚 Swagger (Conditional)
// ============================================

builder.Services.AddEndpointsApiExplorer();

if (enableSwagger)
{
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Version = "v1",
            Title = "Tool Management System API",
            Description = "An ASP.NET Core Web API for managing tools and users",
            Contact = new OpenApiContact
            {
                Name = "Tool Management System"
            }
        });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });

        var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath);
        }
    });
}

// ============================================
// 🚀 APP PIPELINE
// ============================================

var app = builder.Build();

// Swagger (only if enabled)
if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Tool Management System API v1");
        options.RoutePrefix = "swagger";
        options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        options.DefaultModelsExpandDepth(-1);
    });
}

// Security Headers (Production only)
if (!isDevelopment)
{
    app.Use(async (context, next) =>
    {
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        await next();
    });
}

// Middleware Pipeline (SIRA ÖNEMLİ!)
app.UseHttpsRedirection();

// Static files ÖNCE
app.UseStaticFiles();

app.UseRouting();

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

// API endpoints
app.MapControllers();

// SPA Fallback - EN SONDA
app.MapFallbackToFile("index.html");

// ============================================
// 🗄️ Database Initialization
// ============================================

using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (isDevelopment)
        {
            context.Database.EnsureCreated();
        }
        // Production'da migration kullan, EnsureCreated değil
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Database initialization error");

        if (!isDevelopment)
        {
            throw; // Production'da hata varsa uygulama başlamasın
        }
    }
}

app.Run();
