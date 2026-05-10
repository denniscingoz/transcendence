using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Transcendence.Api.Common.Extensions;
using Transcendence.Api.Configurations;
using Transcendence.Api.Realtime;
using Transcendence.Api.Realtime.Services;
using Transcendence.Application;
using Transcendence.Application.Auth.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Infrastructure;
using Transcendence.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args); // builds, loads configurations such as appsettings.json, enviorenment vars

// ================= SERVICES =================

builder.Services.AddEndpointsApiExplorer(); //registers swagger services for api documentation
builder.Services.AddSwaggerGen(); // makes ASP.NET Core dsicover API endpoints, so they appear on Swagger
builder.Services.AddSwaggerDocumentation(); // swagger documentation addition

// CORS or Cross-Origin Resource Sharing to let calls from that adress,
// It is for development times not for production
builder.Services.AddCors(options => 
{
	options.AddPolicy("DevCors", policy =>
	{
		policy
			.WithOrigins("http://localhost:5067")
			.AllowAnyHeader()
			.AllowAnyMethod()
			.AllowCredentials();
	});
});

// JWT - JSON Web Token
//
var jwtSection = builder.Configuration.GetSection("Jwt"); //read the config -- appsetings
var key = jwtSection["Key"]!; 

//Enabling JWT auth., Auth method
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
builder.Services.AddControllers(); //adding controllers to the backend for API side.

// Logging
builder.Logging.ClearProviders(); //clear the loggin from defaults
builder.Logging.AddConsole(); // added them to console so we can check the logs from docker compose logs api

// ================= APP =================

var app = builder.Build(); //creating the app from configuration above.

app.UseGlobalExceptionHandling(); // use global exception handling so we can control the outcome and code it instead of crash

// it is for running the database migrations automatically when the app runs
using (var scope = app.Services.CreateScope())
{
	var logger = scope.ServiceProvider
		.GetRequiredService<ILoggerFactory>()
		.CreateLogger("DatabaseMigration");

	try
	{
		var dbContext = scope.ServiceProvider.GetRequiredService<TranscendenceDbContext>();

		logger.LogInformation("Applying database migrations...");
		dbContext.Database.Migrate();
		logger.LogInformation("Database migrations applied successfully.");
	}
	catch (Exception ex)
	{
		logger.LogError(ex, "An error occurred while applying database migrations.");
		throw;
	}
}

app.UseStaticFiles();

app.UseRouting();//routing is added so we can call different like api/get post/postid etc
app.UseCors("DevCors"); //being able to run the cors on development

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