using System.Drawing;
using System.Net.WebSockets;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.VisualBasic;
using Transcendence.Application.Chat.Abstractions;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Chat.Realtime.Contracts;

namespace Transcendence.Api.Realtime.Hubs;

public sealed class ChatHub : BaseHub<IRealtimeClient>
{
    private readonly IChatService _chatService;

    public ChatHub( IChatService chatService)
    {
        _chatService = chatService;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserIdOrThrow();
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId)); // add connId to user's collection of connections  
        var presence = new PresenceEventDto
        {
            UserId = userId.Value,
            IsOnline = true,
            ChangedAt = DateTimeOffset.UtcNow
        };
            await Clients.All.UserOnline(presence);

        await base.OnConnectedAsync();
    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = TryGetUserId();

        if (userId is not null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.User(userId.Value)); 

            var presence = new PresenceEventDto
            {
                UserId = userId.Value,
                IsOnline = false,
                ChangedAt = DateTimeOffset.UtcNow
            };

            await Clients.All.UserOffline(presence);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinConversation(Guid conversationId)
    {
        var userId = GetUserIdOrThrow();
        _chatService.AssertUserIsParticipant(conversationId, UserUd);
        await Group.AddToGroupAsync(Context.ConnectionId, GroupNames.Conversation(conversationId)); //SignalR does all
    }

    public async Task LeaveConversation(Guid converationId)
    {
        await Group.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.Conversation(conversationId)); 
    }

    public async Task SendMessage(SendMessageCommandDto dto)
    {
        var senderId = GetUserIdOrThrow();

        var messageDto = await _chatService.SendMessageAsync(
            senderId: senderId,
            conversionId: dto.ConversationId,
            clientMessageId: dto.ClientMessageId, 
            content: dto.Content
        );

        await Clients.Group(GroupNames.Conversation(dto.ConversationId))
                     .MessageReceived(messageDto); 
         
        await Clients.Caller.MessageAck(new MessageAckDto
        {
            ClientMessageId = dto.ClientMessageId,
            MessageId = message.MessageId, 
            CreatedAt = message.CreatedAt
        });
    }

}      
/*
Client
  │ SendMessageCommandDto
  ▼
ChatHub
  │
  │ calls
  ▼
ChatService
  │
  │ creates
  ▼
Message (Domain)
  │
  │ saved
  ▼
Database
  │
  │ mapping
  ▼
ChatMessageDto
  │
  │ returns
  ▼
ChatHub
  │
  │ sents
  ▼
Clients.Group

User A
 ├─ connectionId 1 (browser)
 ├─ connectionId 2 (mobile)

User B
 ├─ connectionId 3

Groups:
"user:A" → [conn1, conn2]
"user:B" → [conn3]

"conv:123" → [conn1, conn3]

Clients.Group(GroupNames.Conversation(conversationId)) delivers messages
to all connections that joined the given conversation group.
A single user may receive the message multiple times if they have
multiple active connections (browser, mobile, multiple tabs).

Groups.AddToGroupAsync(connectionId, GroupNames.User(userId)) adds the
current connection to a user-specific group. This group represents
all active connections of a single user and is independent from
conversation membership.

A user can belong to the user group without belonging to any
conversation group until JoinConversation is called.


User-group = “кому”
Conversation-group = “где”
*/