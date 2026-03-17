using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Transcendence.Application.Auth.Interfaces;
using Transcendence.Application.Files.Interface;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Friends.Queries;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Domain.Auth;
using Transcendence.Domain.Users;
using Transcendence.Infrastructure.Auth;
using Transcendence.Infrastructure.Persistence;
using Transcendence.Infrastructure.Query;
using Transcendence.Infrastructure.Repositories;
using Transcendence.Infrastructure.Storage;

namespace Transcendence.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<TranscendenceDbContext>(options =>options.UseNpgsql(connectionString)); // config DBcontetx and uses Npgsql.EntityFrameworkCore.PostgreSQL

        services.AddScoped<IUserRepository, UserRepository>(); // when IUserRepository needed - creates UserRepository

		services.AddScoped<IPostsRepository, PostsRepository>();
		services.AddScoped<IPostsFeedRepository, PostsFeedRepository>();
		services.AddScoped<IPostsProfileRepository, PostsProfileRepository>();


		services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
		services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));


		services.AddScoped<IFriendsQuery, FriendsQuery>();
        services.AddScoped<IFriendshipRepository, FriendshipRepository>();
		services.AddScoped<IFriendRequestRepository, FriendRequestRepository>();
		

        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAuthRepository, AuthRepository>();


		services.AddScoped<IFilesRepository, FilesRepository>();
        services.AddScoped<IFilesStorage, FilesStorage>();


		return services;
    }
}
