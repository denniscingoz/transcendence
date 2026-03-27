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
        return await _db.Conversations
                    .Include(c => c.Participants)
                    .SingleOrDefaultAsync(c => c.Id == id); // return 0 = null, 1 = object, 1 > = exception 
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

    public async Task <IReadOnlyList <Guid>> GetUserConversationsIds(Guid userId){
        return await _db.Conversations.Where(c => c.Participants.Any(p=> p.UserId == userId))
                                      .Select(c => c.Id)
                                      .ToListAsync();
    }
    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
      public async Task <IReadOnlyList<Guid>>  GetParticipantsIds(Guid conversationId)
    {
        return await  _db.ConversationParticipants
                        .Where(p => p.ConversationId == conversationId)
                        .Select(P => P.UserId)
                        .ToListAsync();
       
    }

    // public async Task <IReadOnlyList<ConversationParticipant>>  GetOtherParticipants(Guid userId, Guid conversationId)
    // {
    //     return await  _db.ConversationParticipants
    //                     .Where(p => p.ConversationId == conversationId && p.UserId != userId).ToListAsync();
       
    // }
    public async Task <IReadOnlyList<ConversationParticipant>>  GetConversationParticipants( Guid conversationId)
    {
        return await  _db.ConversationParticipants
                        .Where(p => p.ConversationId == conversationId).ToListAsync();
       
    }
        public async Task <ConversationParticipant>  GetParticipant(Guid userId, Guid conversationId)
    {
        return await  _db.ConversationParticipants
                        .FirstAsync(p => p.ConversationId == conversationId &&
                             p.UserId == userId);
       
    }
    //  public async Task <IReadOnlyList<Guid>>  GetUserInterlocutors(Guid userId)
    // {
    //         return await _db.ConversationParticipants
    //                 .Where(p => p.UserId != userId)                 //  3
    //                     .Where(p => _db.ConversationParticipants            //  2 all participants in the conversations
    //                             .Where(cp => cp.UserId == userId)           //  1 finds the lines where our user is involved
    //                             .Select(cp => cp.ConversationId)            //  1 takes the ConversationId of his conversations
    //                             .Contains(p.ConversationId)                 //  2 check: conversationId of current p is among these conversations
    //                     )
    //                 .Select(p => p.UserId)                          //  3  
    //                 .Distinct()                                     //  3 
    //                 .ToListAsync();                                 //  3 
       
    // }
    /*
                    SELECT DISTINCT p.UserId
                    FROM ConversationParticipants p
                    WHERE p.UserId <> @userId
                    AND p.ConversationId IN (
                        SELECT cp.ConversationId
                        FROM ConversationParticipants cp
                        WHERE cp.UserId = @userId
                    )
    */
}