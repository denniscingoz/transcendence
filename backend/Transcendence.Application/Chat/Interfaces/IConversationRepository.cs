using Transcendence.Domain.Chat;

namespace Transcendence.Application.Chat.Interfaces;

public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(Guid id);
    Task <Conversation?> GetDirectConversation(Guid userA, Guid userB);
    Task AddAsync(Conversation Async);
    Task SaveChangesAsync();
} 