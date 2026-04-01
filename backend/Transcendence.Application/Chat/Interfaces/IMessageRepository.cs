using Transcendence.Domain.Chat;

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

}

/*
Controller → initial data
Hub        → realtime events
ChatService → business logic
Conversation → context
Message     → facts
DTO         → transport
*/