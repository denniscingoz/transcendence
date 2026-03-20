using Transcendence.Domain.Chat;
using Transcendence.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

public sealed class  MessageRepository : IMessageRepository
{
    private readonly TranscendenceDbContext _db; 

    public MessageRepository (TranscendenceDbContext db)
    {
        _db = db;
    }
    public async Task AddAsync(Message message)
    {
        Console.WriteLine("Repo Add message conv = " + message.ConversationId);
        await _db.Messages.AddAsync(message);
    }
    public async Task <Message?> GetByClientMessageIdAsync(Guid senderId, Guid clientMessageId)
    {
        return await _db.Messages
            .SingleOrDefaultAsync(m => m.SenderId == senderId 
                && m.ClientMessageId == clientMessageId);
    }    
    public async Task <IReadOnlyList<Message>> GetByConversationIdAsync(
        Guid conversationId, int offset, int limit
        )
    {
        return await _db.Messages
        .Where(m => m.ConversationId == conversationId)
        .OrderBy(m => m.CreatedAt)
        .Skip(offset)
        .Take(limit)
        .ToListAsync();
    }
        public async Task<Guid?> GetLastMessageId(Guid conversationId)
        {
                    return await _db.Messages.Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => m.Id)
                .FirstOrDefaultAsync();
        }
}

 