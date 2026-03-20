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

    public override async Task OnConnectedAsync() // зашел на сайт
    {
        var userId = Context.User.GetUserId();

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId)); // add connId to user's collection of connections  
        Console.WriteLine($"User {userId} joined group user:{userId}");
        
        var userConversations = await _chatService.GetUserConversationsIds(userId);
        foreach (var c in userConversations)
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.Conversation(c)); // это группы чатов сигналR он добавляет соеденине, то есть тут id conversations SignalR и те что у нас в базе пересекаются

          if (_presenceService.AddConnection(userId, Context.ConnectionId)) //became online
        {
            var presence = new PresenceEventDto
            {
                UserId = userId,
                IsOnline = true,
                ChangedAt = DateTimeOffset.UtcNow
            };
 
            foreach(var c in userConversations)
                await Clients.Group(GroupNames.Conversation(c)).UserOnLine(presence);
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
         
        await Clients.Caller.OnlineUsersSnapshot(onlineUsers);
 
        await base.OnConnectedAsync();
    }

//     public override async Task OnConnectedAsync()
// {
//     var userId = Context.User.GetUserId();

//     var becameOnline =
//         _presenceService.AddConnection(userId, Context.ConnectionId);

//     await Groups.AddToGroupAsync(
//         Context.ConnectionId,
//         GroupNames.User(userId));

//     var conversations =
//         await _chatService.GetUserConversationsIds(userId);

//     foreach (var c in conversations)
//         await Groups.AddToGroupAsync(
//             Context.ConnectionId,
//             GroupNames.Conversation(c));

//     var onlineUsers =
//         _presenceService.GetOnlineUsers();

//     await Clients.Caller
//         .OnlineUsersSnapshot(onlineUsers);

//     await base.OnConnectedAsync();
// }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User.TryGetUserId();

        if (userId is not null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.User(userId.Value)); 
            if (_presenceService.RemoveConnection(userId.Value, Context.ConnectionId)) // no more
            {
                var presence = new PresenceEventDto
                {
                    UserId = userId.Value,
                    IsOnline = false,
                    ChangedAt = DateTimeOffset.UtcNow
                };
                var userConversations = await _chatService.GetUserConversationsIds(userId.Value);//??!!!

                foreach(var conv in userConversations)
                    await Clients.Group(GroupNames.Conversation(conv)).UserOffLine(presence);
            }

        }
        await base.OnDisconnectedAsync(exception);
    
    /*
        Почему не бросают throw здесь
        OnDisconnectedAsync — это notification, а не операция
        соединение уже мертво. ничего “починить” нельзя.
        throw ничего не изменит

        Поэтому: exception передаётся (для логирования
            для аналитики нестабильных клиентов
            для отладки reconnect’ов
            НЕ для бизнес-логики
        )но не пробрасывается
    */

        //OnDisconnectedAsync is a lifecycle hook provided by SignalR. It is invoked by the framework when a client connection is terminated. We override it to execute domain-specific cleanup logic, while still calling the base implementation to allow SignalR to perform its internal resource cleanup. At this point, the HTTP request is already completed, but the authenticated user’s ClaimsPrincipal is still available via the Hub context.
    }

    public async Task JoinConversation(Guid conversationId) //by client
    {
        var userId = Context.User.GetUserId();
        await _chatService.AssertUserIsParticipant(conversationId, userId); 
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.Conversation(conversationId)); //SignalR does all
    }
 
    public async Task LeaveConversation(Guid conversationId) //browser tab closed
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.Conversation(conversationId));  //signalR
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
        await Clients.Group(GroupNames.Conversation(dto.ConversationId)) //message
                    .MessageReceived(messageDto); //online users with opened chats (client's method MessageReceived calls )

        var receivers = await _chatService.GetParticipantsIds(dto.ConversationId);

        await _notificationService.NotifyNewMessage(receivers, senderId, messageDto); // online users with closed chat window
        
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
        return Clients.Caller.OnlineUsersSnapshot(online);
    }
   
    public async Task DeliveredMessage(Guid messageId, Guid conversationId, Guid senderId)
    {
        var  userId = Context.User.GetUserId(); 
        

        await Clients
                .Group(GroupNames.User(senderId))  
                .MessageDelivered(new MessageDeliveredDto
                {
                    ReaderId = userId,
                    MessageId = messageId                
                });
    }

    public  async Task MarkAsRead(Guid conversationId) //callling by client
    {
        var  userId = Context.User.GetUserId(); 

        await _chatService.MarkConversationAsRead(userId, conversationId);
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
    /*

    connection.invoke → запрос к серверу

    Clients.* → сервер пушит событие

    connection.on → клиент слушает события


    CLIENT (reader)
   |
   | invoke MarkAsRead
   v

    HUB
   |
   | → ChatService.MarkConversationAsRead
   |       (запись в БД)
   |
   | → Clients.OthersInGroup
           (уведомление отправителей)

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
}
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