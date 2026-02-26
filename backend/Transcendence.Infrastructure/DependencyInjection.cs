using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Infrastructure.Persistence;
using Transcendence.Infrastructure.Repositories;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Friends.Queries;
using Transcendence.Application.Friends.Interfaces;

namespace Transcendence.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<TranscendenceDbContext>(options =>
            options.UseNpgsql(connectionString)); // config DBcontetx and uses Npgsql.EntityFrameworkCore.PostgreSQL
        services.AddScoped<IUserRepository, UserRepository>(); // when IUserRepository needed - creates UserRepository
        services.AddScoped<IFriendshipRepository, FriendshipRepository>();
        services.AddScoped<IFriendshipRequestRepository, FriendshipRequestRepository>();
        //services.AddScoped<IPostRepository, PostRepository>(); 
        return services;
    }
}
