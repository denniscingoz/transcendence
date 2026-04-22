using Microsoft.AspNetCore.SignalR;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Api.Realtime.Hubs;

using System.Collections.Generic;
using Transcendence.Application.Friends.DTOs;
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

            await _hub.Clients.Groups(groups)
                .NotificationReceived(NotificationDto.NewMessage(message));
            Console.WriteLine(
             $"Notify message {message.MessageId} to {string.Join(",", groups)}");
    }
    public async Task NotifyFriendRequest(Guid targetUserId, FriendshipRequestDto request)
    {
            
        await _hub.Clients.Group(GroupNames.User(targetUserId))
        .FriendshipRequestReceived(request);

    }
    public async Task NotifyConversationCreated(Guid userA, Guid userB, Guid conversationId)
    {
    var groups = new[]
    {
        GroupNames.User(userA),
        GroupNames.User(userB)
    };
         await _hub.Clients.Groups(groups).ConversationsChanged();
    }
}
/*
User-group

Для личных уведомлений:
	•	новый чат
	•	новые уведомления
	•	presence
	•	“обнови список”

Conversation-group

Для конкретного открытого чата:
	•	realtime messages
	•	message read
	•	message delivered
*/