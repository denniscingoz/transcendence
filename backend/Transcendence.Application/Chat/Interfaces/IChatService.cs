using Transcendence.Application.Chat.DTOs;
using Transcendence.Domain.Chat;
namespace Transcendence.Application.Chat.Interfaces;
public interface IChatService
{
    Task <ChatMessageDto> SendMessageAsync(
        Guid senderId,
        Guid conversationId,
        Guid clientMessageId, 
        string content
    );
    Task <Guid> CreateOrGetDirectConversationAsync(
        Guid userA, Guid userB
        );
    Task <IReadOnlyList<ChatMessageDto>> GetMessagesAsync(
        Guid userId, Guid conversationId, int offset, int limit
    );
    Task AssertUserIsParticipant(Guid conversationId, Guid UserId);
    Task <IReadOnlyList<Guid>>  GetUserConversationsIds(Guid userId);
    Task <IReadOnlyList<Guid>>  GetParticipantsIds(Guid conversationId);
    Task MarkConversationAsRead(Guid userId, Guid conversationId);
    Task<Guid?> GetLastMessageId(Guid conversationId);
};

/*
ChatService is where business logic starts.

The Hub is only a transport adapter: it receives realtime calls,
extracts the user identity and delegates the operation to the Application layer.

ChatService is responsible for enforcing domain rules, validating input,
persisting messages and returning the resulting ChatMessageDto.
It must not depend on SignalR, groups or client connections.
*/


 