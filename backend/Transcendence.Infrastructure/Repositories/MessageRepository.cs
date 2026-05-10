using Transcendence.Domain.Chat;
using Transcendence.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;
using Transcendence.Application.Chat.DTOs;
namespace Transcendence.Infrastructure.Repositories;
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
    public async Task<IReadOnlyList<Message>> GetByConversationIdAsync(
        Guid conversationId,
        int offset,
        int limit)
    {
        var messages = await _db.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();

        return messages
            .OrderBy(m => m.CreatedAt)
            .ToList();
    }
    public async Task<Guid?> GetLastMessageId(Guid conversationId)
    {
                return await _db.Messages.Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => m.Id)
            .FirstOrDefaultAsync();
    }
    public async Task <Message?> GetByIdAsync(Guid messageId )
    {
        return await _db.Messages
            .SingleOrDefaultAsync(m => m.Id ==  messageId);
    }
        public async Task<int> GetUnreadCount(Guid conversationId, Guid userId, DateTimeOffset? lastRead)
    {
       var querry =  _db.Messages.Where(m=> m.ConversationId == conversationId)
                                .Where(m => m.SenderId != userId);

        if (lastRead.HasValue)
            querry = querry.Where(m => m.CreatedAt > lastRead);
        return  await querry.CountAsync();
    }
    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
    
    public async Task<IReadOnlyList<Message>> GetUndeliveredIncomingMessagesAsync(Guid userId)
    {
            return await _db.ConversationParticipants
                                    .Where(p => p.UserId == userId )
                                    .SelectMany(p => _db.Messages
                                    .Where(m => m.ConversationId == p.ConversationId)
                                    .Where(m=> !m.IsDeleted))
                                    .ToListAsync();
    }

}

 