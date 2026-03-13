using Microsoft.AspNetCore.SignalR;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Api.Realtime.Hubs;
using System.Collections.Generic;
namespace  Transcendence.Api.Realtime.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<ChatHub, IRealtimeClient> _hub; //IHubContext - bridge from service to Hub 
    public NotificationService (IHubContext<ChatHub, IRealtimeClient>  hub)
    {
        _hub = hub;
    }
    public async Task NotifyNewMessage( IEnumerable<Guid> participants, Guid senderId,
            ChatMessageDto message)
    {
            var groups  = participants.Where(p => p != senderId).Select(GroupNames.User).ToList();

            // await _hub.Clients.Groups(groups)
            //                   .NotificationReceived(NotificationDto.NewMessage(message));
            await _hub.Clients.All
                .NotificationReceived(NotificationDto.NewMessage(message));
            Console.WriteLine(
             $"Notify message {message.MessageId} to {string.Join(",", groups)}");
    }
}