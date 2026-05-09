using Transcendence.Domain.Chat;
using Transcendence.Application.Chat.DTOs;

public interface IMessageRepository
{
    Task AddAsync(Message message);
    Task <Message?> GetByClientMessageIdAsync(Guid senderId, Guid clientMessageId ); 
    Task <IReadOnlyList<Message>> GetByConversationIdAsync(
        Guid conversationId,
        int offset,
        int limit
    );
    Task<Guid?> GetLastMessageId(Guid conversationId);
    Task <Message?> GetByIdAsync(Guid MessageId ); 

    Task<int> GetUnreadCount(Guid conversationId, Guid userId, DateTimeOffset? LastRead);
     Task SaveChangesAsync();
     
        Task<IReadOnlyList<Message>> GetUndeliveredIncomingMessagesAsync(Guid userId);
}

/*
Controller → initial data
Hub        → realtime events
ChatService → business logic
Conversation → context
Message     → facts
DTO         → transport
*/