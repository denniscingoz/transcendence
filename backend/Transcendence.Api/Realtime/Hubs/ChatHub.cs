using System.Drawing;
using System.Net.WebSockets;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.VisualBasic;
using Transcendence.Application.Chat.Interfaces;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Realtime.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Api.Common.Extensions;
using  Transcendence.Api.Realtime.Hubs;
using System.Text.Json;
using System.IO.IsolatedStorage;
using System.Collections.Specialized;

namespace Transcendence.Api.Realtime.Hubs;

public sealed class ChatHub : Hub<IRealtimeClient> 
{
    private readonly IChatService _chatService;
    private readonly IPresenceService _presenceService;
    private readonly INotificationService _notificationService;
    public ChatHub( IChatService chatService, IPresenceService presenceService, INotificationService notificationService )
    {
        _chatService = chatService;
        _presenceService = presenceService;
        _notificationService = notificationService;
    }

    // public override async Task OnConnectedAsync() // triggered when a client establishes a SignalR connection
    // {
    //     var userId = GetUserId();
 
    //       if (_presenceService.AddConnection(userId, Context.ConnectionId)) // returns true if this is the first active connection (user just became online)
    //     {
    public override async Task OnConnectedAsync()
{
    var userId = GetUserId();

    Console.WriteLine($"OnConnectedAsync fired. ConnectionId={Context.ConnectionId}, UserId={userId}");

    await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId));

       await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId)); // add connId to user's collection of connections  
        Console.WriteLine($"User {userId} joined group user:{userId}");
        
        var userConversations = await _chatService.GetUserConversationsIds(userId);
        foreach (var c in userConversations)
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.Conversation(c)); // add connection to conversation groups (group names are based on DB conversation IDs)

    var becameOnline = _presenceService.AddConnection(userId, Context.ConnectionId);

    Console.WriteLine(
        $"AddConnection result. UserId={userId}, ConnectionId={Context.ConnectionId}, BecameOnline={becameOnline}");
    if (becameOnline)
        {
            var presence = new PresenceEventDto
            {
                UserId = userId,
                IsOnline = true,
                ChangedAt = DateTimeOffset.UtcNow
            };
 
            foreach(var c in userConversations)
                await Clients.Group(GroupNames.Conversation(c)).UserOnLine(presence);  // broadcast to all active connections in the conversation group (all tabs/devices)
            /*  same faster:
                var tasks = userConversations
                            .Select(c => Clients.Group(GroupNames.Conversation(c)).UserOnline(presence));
                await Task.WhenAll(tasks);
            */
           
        }

        var onlineUsers = new HashSet<Guid>(); 
        
        foreach(var conv in userConversations)
        {
            var participants = await _chatService.GetParticipantsIds(conv);

            foreach (var p in participants)
            {
                if (p != userId && _presenceService.IsOnline(p)) 
                    onlineUsers.Add(p);
            }
        }
         
        await Clients.Caller.OnlineUsersSnapshot(
            onlineUsers.Select(id => id.ToString())
        );
        await base.OnConnectedAsync();
    }
 public override async Task OnDisconnectedAsync(Exception? exception)
{
    var userId = TryGetCurrentUserId();

    Console.WriteLine($"OnDisconnectedAsync fired. ConnectionId={Context.ConnectionId}, UserId={userId}");

    if (userId is not null)
    {
        var removedLast = _presenceService.RemoveConnection(userId.Value, Context.ConnectionId);

        Console.WriteLine(
            $"RemoveConnection result. UserId={userId.Value}, ConnectionId={Context.ConnectionId}, RemovedLast={removedLast}");

        if (removedLast)
        {
            var presence = new PresenceEventDto
            {
                UserId = userId.Value,
                IsOnline = false,
                ChangedAt = DateTimeOffset.UtcNow
            };

            var userConversations = await _chatService.GetUserConversationsIds(userId.Value);

            Console.WriteLine(
                $"Broadcasting UserOffLine for user {userId.Value} to {userConversations.Count} conversations");

            foreach (var conv in userConversations)
                await Clients.Group(GroupNames.Conversation(conv)).UserOffLine(presence);
        }
    }
    else
    {
        Console.WriteLine($"OnDisconnectedAsync could not resolve user. ConnectionId={Context.ConnectionId}");
    }

    await base.OnDisconnectedAsync(exception);
}

    // public override async Task OnDisconnectedAsync(Exception? exception)//triggered when a SignalR connection is closed (tab closed, network lost, etc.)
    // {
    //     var userId = TryGetCurrentUserId();

    //     if (userId is not null)
    //     {
    //         // await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.User(userId.Value)); //not necessary
    //         if (_presenceService.RemoveConnection(userId.Value, Context.ConnectionId)) // no more
    //         {
    //             var presence = new PresenceEventDto
    //             {
    //                 UserId = userId.Value,
    //                 IsOnline = false,
    //                 ChangedAt = DateTimeOffset.UtcNow
    //             };
    //             var userConversations = await _chatService.GetUserConversationsIds(userId.Value);

    //             foreach(var conv in userConversations)
    //                 await Clients.Group(GroupNames.Conversation(conv)).UserOffLine(presence);
    //         }

    //     }
    //     await base.OnDisconnectedAsync(exception); 

    //     //OnDisconnectedAsync is a lifecycle hook provided by SignalR. It is invoked by the framework when a client connection is terminated. We override it to execute domain-specific cleanup logic, while still calling the base implementation to allow SignalR to perform its internal resource cleanup. At this point, the HTTP request is already completed, but the authenticated user’s ClaimsPrincipal is still available via the Hub context.
    // }

    public async Task JoinConversation(Guid conversationId) // user opened a chat → subscribe connection to conversation group
    {
        var userId = GetUserId();
        await _chatService.AssertUserIsParticipant(conversationId, userId); 
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.Conversation(conversationId));
    }
 
    public async Task LeaveConversation(Guid conversationId) //user closed chat → remove connection from conversation group
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.Conversation(conversationId)); 
    }

    public async Task SendMessage(SendMessageCommandDto dto)// user sends a message → persist and broadcast to conversation group
    {
        var senderId = GetUserId();

        var messageDto = await _chatService.SendMessageAsync( //validate, normalize timestamps, and persist message to databas
            senderId,
            dto.ConversationId,
            dto.ClientMessageId,
            dto.Content
        );
        await Clients.Group(GroupNames.Conversation(dto.ConversationId))
                    .MessageReceived(messageDto);

        var receivers = await _chatService.GetParticipantsIds(dto.ConversationId);

        await _notificationService.NotifyNewMessage(receivers, senderId, messageDto);
        
        await Clients.Caller.MessageAck(new MessageAckDto  
        {
            ClientMessageId = dto.ClientMessageId,
            MessageId = messageDto.MessageId,
            CreatedAt = messageDto.CreatedAt
        });
    }

    public Task RequestPresenceSnapshot()
    {
        var online = _presenceService.GetOnlineUsers();
        return  Clients.Caller.OnlineUsersSnapshot(
            online.Select(id => id.ToString())
        );
    }
   
    public async Task DeliveredMessage(Guid messageId, Guid conversationId, Guid senderId)
    {
        var  userId = GetUserId(); 
        

        await Clients
                .Group(GroupNames.User(senderId))  
                .MessageDelivered(new MessageDeliveredDto //send delivery event to all sender's active connections (multi-device support
                {
                    ReaderId = userId,
                    MessageId = messageId                
                });
    }

    public  async Task MarkAsRead(Guid conversationId)
    {
        var  userId = GetUserId(); 

        await _chatService.MarkConversationAsRead(userId, conversationId);
        await _notificationService.NotifyChange(userId);


        var lastMessageId = await _chatService.GetLastMessageId(conversationId);

       await Clients
            .OthersInGroup(GroupNames.Conversation(conversationId))
            .MessageRead(new MessageReadDto
            {
                ConversationId = conversationId,
                ReaderId = userId,
                MessageId = lastMessageId ?? Guid.Empty
            });
    }  
     private Guid GetUserId()
    {
        var claimValue =
            Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? Context.User?.FindFirst("sub")?.Value;

        if (Guid.TryParse(claimValue, out var claimUserId))
            return claimUserId;

        var httpContext = Context.GetHttpContext();

        var devQuery = httpContext?.Request.Query["devUserId"].FirstOrDefault();
        if (Guid.TryParse(devQuery, out var queryUserId))
            return queryUserId;

        var devHeader = httpContext?.Request.Headers["X-Dev-UserId"].FirstOrDefault();
        if (Guid.TryParse(devHeader, out var headerUserId))
            return headerUserId;

        throw new UnauthorizedAccessException("Invalid token.");
    }

    private Guid? TryGetCurrentUserId()
    {
        var claimValue =
            Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? Context.User?.FindFirst("sub")?.Value;

        if (Guid.TryParse(claimValue, out var claimUserId))
            return claimUserId;

        var httpContext = Context.GetHttpContext();

        var devQuery = httpContext?.Request.Query["devUserId"].FirstOrDefault();
        if (Guid.TryParse(devQuery, out var queryUserId))
            return queryUserId;

        var devHeader = httpContext?.Request.Headers["X-Dev-UserId"].FirstOrDefault();
        if (Guid.TryParse(devHeader, out var headerUserId))
            return headerUserId;

        return null;
    }
}
    /*
    connection.invoke → request to server

    Clients.* → сервер пушит событие

    connection.on → client listens to events


    CLIENT (reader)
   |
   | invoke MarkAsRead
   v

    HUB
   |
   | → ChatService.MarkConversationAsRead
   |       (database)
   |
   | → Clients.OthersInGroup
           (notify senders)

        UserA sends message
                |
                v

        Server saves message
                |
                v

        UserB opens chat
                |
                v

        ClientB -> MarkAsRead
                |
                v

        Server updates DB
                |
                v

        Server -> MessageRead -> UserA       
    */

/*

Browser
   │
   ▼
SignalR connection
   │
   ▼
ChatHub
   │
   ├── PresenceService
   │       user → connections
   │
   ├── ChatService
   │       conversations (DB)
   │
   └── SignalR Groups
           user groups
           conversation groups

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
  │ sends
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