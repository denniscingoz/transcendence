
using Microsoft.Extensions.DependencyInjection;
using Transcendence.Application.Chat.Abstractions;
using Transcendence.Application.Chat.Services;
using Transcendence.Application.Messages.Abstractions;
using Transcendence.Application.Messages.Services;
using Transcendence.Application.Users.Services;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Friends.Services;

namespace Transcendence.Application;

public static class DependencyInjection
{
	public static IServiceCollection AddApplication (this IServiceCollection services) // add my method to services
	{
		//Chats & Messages:
		services.AddScoped<IChatService, ChatService>();
		services.AddScoped<IMessageService, MessageService>();

		// Users & Profiles:
		services.AddScoped<IProfileService, ProfileService>();
		services.AddScoped<IFriendsService, FriendsService>();
		
		return services;
	}
}

