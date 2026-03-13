
using Microsoft.Extensions.DependencyInjection;
using Transcendence.Application.Chat.Interfaces;
using Transcendence.Application.Chat.Services;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Application.Users.Services;
<<<<<<< HEAD
<<<<<<< HEAD
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Friends.Services;
using Transcendence.Application.Auth.Interfaces;
using Transcendence.Application.Auth.Services;
using Transcendence.Application.Files.Interface;
using Transcendence.Application.Files.Service;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Posts.Services;
=======
using Transcendence.Application.Services;
>>>>>>> 8fcdb03 (presence added)
=======
>>>>>>> 5436581 (fixed presence issues, added notifications when not active tab)

namespace Transcendence.Application;

public static class DependencyInjection
{
<<<<<<< HEAD

	public static IServiceCollection AddApplication (this IServiceCollection services) // add my method to services
	{
		//Chats & Messages:
		services.AddScoped<IChatService, ChatService>();
		services.AddScoped<IMessageService, MessageService>();

		// Users & Profiles:
		services.AddScoped<IProfileService, ProfileService>();
		services.AddScoped<IFriendsService, FriendsService>();
		services.AddScoped<IAuthService, AuthService>();
		services.AddScoped<IFilesService, FilesService>();

		//Posts & Feeds:
		services.AddScoped<IPostsService, PostsService>();
		services.AddScoped<IPostsProfileService, PostsProfileService>();
		services.AddScoped<IPostsFeedService, PostsFeedService>();

		//Auth
		services.AddScoped<IAuthService, AuthService>();
		services.AddScoped<IGoogleAuthService, GoogleAuthService>();


		//Friends
		services.AddScoped<IFriendsService, FriendsService>();

		return services;
	}

=======
    public static IServiceCollection AddApplication (this IServiceCollection services) // adds services from the Application layer to the DI container
    {
        //my services:
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<FollowService>();
        services.AddScoped<ProfileService>();
        services.AddSingleton<IPresenceService, PresenceService>();         
        


        return services;    
    }
>>>>>>> 8fcdb03 (presence added)
}

