using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using Transcendence.Api.Configurations;
using Transcendence.Api.Realtime;

using Transcendence.Application;
using Transcendence.Application.Auth.DTOs;

using Transcendence.Infrastructure;
using Transcendence.Api.Realtime.Services;
using Transcendence.Application.Realtime.Contracts;
var builder = WebApplication.CreateBuilder(args);

// ================= SERVICES =================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerDocumentation();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = jwtSection["Key"]!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)),

            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],

            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });
        

// Google auth
builder.Services.Configure<GoogleAuthOptions>(
    builder.Configuration.GetSection("GoogleAuth"));

// Authorization
builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
})
.AddJsonProtocol(o =>
{
    o.PayloadSerializerOptions.PropertyNameCaseInsensitive = true;
});

// Layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddControllers();

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ================= APP =================

var app = builder.Build();

app.UseStaticFiles();

app.UseRouting();
app.UseCors("DevCors");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

// Endpoints
app.MapChatEndpoints();
app.MapControllers();

app.Run();
/*
1. builder = WebApplication.CreateBuilder()
2. builder.Services.AddXxx()        ← DependencyInjection
3. app = builder.Build()
4. app.UseXxx()                     ← Middleware 
5. app.MapXxx()                     ← Endpoints (routing)
6. app.Run()

Роли слоёв (очень важно)

🟢 Domain
	•	сущности
	•	бизнес-правила
	•	ни от кого не зависит

🟢 Application
	•	use cases
	•	интерфейсы (IChatService, IMessageService)
	•	НЕ знает, КАК это реализовано

🟢 Infrastructure
	•	реализует интерфейсы из Application
	•	БД, SignalR, AI, BackgroundJobs
	•	должна знать интерфейсы, которые реализует

👉 иначе она не сможет их реализовать

*/

/*
Api ─────▶ Application ─────▶ Domain
 │            ▲
 │            │
 └────▶ Infrastructure ─────┘


Внутренние слои НЕ ЗНАЮТ, КАК они вызываются!!!

Api знает всё, потому что он “снаружи”
Application знает только Domain
Infrastructure знает Application, чтобы реализовать интерфейсы
Domain НИЧЕГО НЕ ЗНАЕТ
❗ Domain — центр. Всё остальное — вокруг

*/