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
		var (u1, u2) = Normalize(userAId, userBId);
		return _db.Friendships.AnyAsync(x => x.User1Id == u1 && x.User2Id == u2, ct);
	}

	public async Task<string> GetFriendshipStatusAsync(Guid currentUserId, Guid otherUserId, CancellationToken ct)
	{
		if (await _db.Friendships.AnyAsync(
			x => (x.User1Id == currentUserId && x.User2Id == otherUserId) ||
				 (x.User1Id == otherUserId && x.User2Id == currentUserId),
			ct))
		{
			return "friends";
		}

		if (await _db.FriendshipRequests.AnyAsync(
			x => x.RequesterId == currentUserId && x.TargetUserId == otherUserId,
			ct))
		{
			return "outgoingRequest";
		}

		if (await _db.FriendshipRequests.AnyAsync(
			x => x.RequesterId == otherUserId && x.TargetUserId == currentUserId,
			ct))
		{
			return "incomingRequest";
		}

		return "none";
	}

	public async Task AddAsync(Friendship friendship, CancellationToken ct)
	{
		await _db.Friendships.AddAsync(friendship, ct);
		// NOTE: SaveChanges is usually done by UnitOfWork / transaction pipeline, not here.
	}

	public async Task RemoveAsync(Guid userAId, Guid userBId, CancellationToken ct)
	{
		var (u1, u2) = Normalize(userAId, userBId);

		var entity = await _db.Friendships
			.SingleOrDefaultAsync(x => x.User1Id == u1 && x.User2Id == u2, ct);

		if (entity is null) return; // service already checks NotFriends

		_db.Friendships.Remove(entity);
	}
	
	public async Task <int> CountFriendsAsync (Guid userId, CancellationToken ct)
	{
		return await _db.Friendships.CountAsync(x => x.User1Id == userId || x.User2Id == userId, ct);
	}

	public async Task<IReadOnlyList<Guid>> ListFriendsAsync(Guid userId, CancellationToken ct)
	{
		// returns friend IDs, not User objects
		var ids = await _db.Friendships
			.Where(f => f.User1Id == userId || f.User2Id == userId)
			.Select(f => f.User1Id == userId ? f.User2Id : f.User1Id)
			.ToListAsync(ct);

		return ids;
	}
	
	public async Task SaveChangesAsync(CancellationToken ct)
	{
		await _db.SaveChangesAsync(ct);
	}

	private static (Guid u1, Guid u2) Normalize(Guid a, Guid b)
		=> a.CompareTo(b) < 0 ? (a, b) : (b, a);
}
