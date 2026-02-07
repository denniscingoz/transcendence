using Transcendence.Application.Chat.Interfaces;
using Transcendence.Domain.Chat;
using Transcendence.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace Transcendence.Infrastructure.Repositories;

public sealed class ConversationRepository : IConversationRepository
{
    private readonly TranscendenceDbContext _db;

    public ConversationRepository (TranscendenceDbContext db)
    {
        _db = db;
    }

    public async Task<Conversation?> GetByIdAsync(Guid id)
    {
        return await _db.Conversations.SingleOrDefaultAsync(c => c.Id == id); // return 0 = null, 1 = object, 1 > = exception 
    }
    public async Task <Conversation?> GetDirectConversation(Guid userA, Guid userB)
    {
        return await _db.Conversations
            .Where(c => c.Type == ConversationType.Direct)
            .Where(c => c.Participants.Any(p => p.UserId == userA) && c.Participants.Any(p=> p.UserId == userB))
            .SingleOrDefaultAsync();
    }
    public async Task AddAsync(Conversation conversation)
    {
        await _db.Conversations.AddAsync(conversation);
    }
    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}