using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Domain.Friends;
using Transcendence.Infrastructure.Persistence;

namespace Transcendence.Infrastructure.Repositories;

public sealed class FriendshipRepository : IFriendshipRepository
{
    private readonly TranscendenceDbContext _db;

    public FriendshipRepository(TranscendenceDbContext db)
        => _db = db;

    public Task<bool> IsFriendAsync(Guid userAId, Guid userBId, CancellationToken ct) // database level logic, not service
    {
        //var (u1, u2) = Normalize(userAId, userBId);
        //return _db.Friendships.AnyAsync(x => x.User1Id == u1 && x.User2Id == u2);
        throw new NotImplementedException("Should be implemented");
    }

    public async Task AddAsync(Friendship friendship, CancellationToken ct)
    {
        throw new NotImplementedException("Should be implemented");
        //await _db.Friendships.AddAsync(friendship);
        // NOTE: SaveChanges is usually done by UnitOfWork / transaction pipeline, not here.
    }

    public async Task RemoveAsync(Guid userAId, Guid userBId)
    {
        var (u1, u2) = Normalize(userAId, userBId);

        // No need to load entire entity: delete by key efficiently.
        var entity = await _db.Friendships
            .FirstOrDefaultAsync(x => x.User1Id == u1 && x.User2Id == u2);

        if (entity is null) return; // service already checks NotFriends

        _db.Friendships.Remove(entity);
        //var follow = new Friendship(userAId, userBId, DateTime.Now); // (Guid userAId, Guid userBId, DateTime createdAt)
		//_db.UserFollows.Remove(follow);
        //return Task.CompletedTask; // используется когда метод async по контракту, но внутри синхронный
    }
    
    public async Task <int> CountFriendsAsync (Guid userId, CancellationToken ct)
    {
        return await _db.UserFollows.CountAsync(x => x.User2Id == userId);
    }
	
	// public Task<int> CountByUserIdAsync(Guid userId)
    // {
    //     return _db.Friendships.CountByUserIdAsync(f => f.User1Id == userId || f.User2Id == userId);
    //     //return await _db.UserFollows.CountAsync(x => x.User2Id == userId);
    // }

    public async Task<IReadOnlyList<Guid>> ListFriendsAsync(Guid userId)
    {
        //throw new NotImplementedException("Should be implemented");
        // returns friend IDs, not User objects
        var ids = await _db.Friendships
            .Where(f => f.User1Id == userId || f.User2Id == userId)
            .Select(f => f.User1Id == userId ? f.User2Id : f.User1Id)
            .ToListAsync();

        return ids;
    }
    
    public async Task SaveChangesAsync(CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}

    private static (Guid u1, Guid u2) Normalize(Guid a, Guid b)
        => a.CompareTo(b) < 0 ? (a, b) : (b, a);
}
