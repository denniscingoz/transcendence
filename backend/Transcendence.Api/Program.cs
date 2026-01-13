using Transcendence.Application;
using Transcendence.Infrastructure;
using Transcendence.Api.Chat;
using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.UserFollows.Interfaces;
using Transcendence.Application.Users.Services;
using Transcendence.Infrastructure.Persistence;
using Transcendence.Infrastructure.Repositories;
using Transcendence.Application.Posts.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer(); // scan endpoints for  OpenAPI
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

builder.Services.AddSignalR();

builder.Services.AddApplication(); //my extention method

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<TranscendenceDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserFollowRepository, UserFollowRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<FollowService>();
builder.Services.AddScoped<ProfileService>();
builder.Services.AddControllers();
/*
	If a class:
	• has dependencies
	• must live within a request
	• is used through a constructor

	it is registered in DI
*/

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseAuthentication();
app.UseAuthorization();

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