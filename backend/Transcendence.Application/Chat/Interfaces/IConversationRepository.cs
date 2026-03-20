using Transcendence.Domain.Chat;

namespace Transcendence.Application.Chat.Interfaces;

public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(Guid id);
    Task <Conversation?> GetDirectConversation(Guid userA, Guid userB);
    Task AddAsync(Conversation Async);
    Task SaveChangesAsync();
    Task <IReadOnlyList <Guid>> GetUserConversationsIds(Guid userId);
    Task <IReadOnlyList<Guid>>  GetParticipantsIds(Guid conversationId);
     Task <IReadOnlyList<ConversationParticipant>>  GetConversationParticipants( Guid conversationId);
     Task <ConversationParticipant>  GetParticipant(Guid userId, Guid conversationId);
    // Task <IReadOnlyList<ConversationParticipant>>  GetOtherParticipants(Guid userId, Guid conversationId);
    
} 