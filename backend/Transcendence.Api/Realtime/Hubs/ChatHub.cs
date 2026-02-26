using System.Drawing;
using System.Net.WebSockets;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.VisualBasic;
using Transcendence.Application.Chat.Abstractions;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Api.Common.Extensions;
using System.Text.Json;//
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
        
        var userId = Context.User.GetUserId();

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId)); // add connId to user's collection of connections  
        var presence = new PresenceEventDto
        {
            UserId = userId,
            IsOnline = true,
            ChangedAt = DateTimeOffset.UtcNow
        };
            await Clients.All.UserOnLine(presence);

        await base.OnConnectedAsync();
    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User.TryGetUserId();

        if (userId is not null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.User(userId.Value)); 

            var presence = new PresenceEventDto
            {
                UserId = userId.Value,
                IsOnline = false,
                ChangedAt = DateTimeOffset.UtcNow
            };

            await Clients.All.UserOffLine(presence);
        }
        await base.OnDisconnectedAsync(exception);

        //OnDisconnectedAsync is a lifecycle hook provided by SignalR. It is invoked by the framework when a client connection is terminated. We override it to execute domain-specific cleanup logic, while still calling the base implementation to allow SignalR to perform its internal resource cleanup. At this point, the HTTP request is already completed, but the authenticated user’s ClaimsPrincipal is still available via the Hub context.
    }

    public async Task JoinConversation(Guid conversationId)
    {
        var userId = Context.User.GetUserId();
        // Console.WriteLine("Hub userId = " + Context.User.GetUserId());
        await _chatService.AssertUserIsParticipant(conversationId, userId);
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.Conversation(conversationId)); //SignalR does all
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.Conversation(conversationId)); 
    }

    public async Task SendMessage(SendMessageCommandDto dto)
    {
        var senderId = Context.User.GetUserId();

        var messageDto = await _chatService.SendMessageAsync(
            senderId,
            dto.ConversationId,
            dto.ClientMessageId,
            dto.Content
        );

        await Clients.Group(GroupNames.Conversation(dto.ConversationId))
                    .MessageReceived(messageDto);

        await Clients.Caller.MessageAck(new MessageAckDto
        {
            ClientMessageId = dto.ClientMessageId,
            MessageId = messageDto.MessageId,
            CreatedAt = messageDto.CreatedAt
        });
    }
}
/*
ChatHub — это transport layer.
	•	принимает WebSocket-соединение
	•	получает вызовы от клиента (SendMessage, JoinConversation)
	•	добавляет connection в SignalR group
	•	рассылает сообщения в group

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
  │ save
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