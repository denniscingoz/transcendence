using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Domain.Friends;
using Transcendence.Infrastructure.Persistence;

namespace Transcendence.Infrastructure.Repositories;

public sealed class FriendshipRequestRepository : IFriendshipRequestRepository
{
	private readonly TranscendenceDbContext _db;

	public FriendshipRequestRepository(TranscendenceDbContext db)
		=> _db = db;

	// public Task<bool> ExistsPendingAsync(Guid requesterId, Guid targetUserId, CancellationToken ct)
	// {
	// 	// You currently have no Status field, so "exists" == "pending".
	// 	return _db.FriendshipRequests.AnyAsync(x =>
	// 		x.RequesterId == requesterId && x.TargetUserId == targetUserId, ct);
	// }
	public Task<bool> ExistsPendingBetweenAsync(Guid userAId, Guid userBId, CancellationToken ct)
	{
		var (u1, u2) = Normalize(userAId, userBId);

		return _db.FriendshipRequests.AnyAsync(
			x => x.User1Id == u1 && x.User2Id == u2,
			ct);
	}

	public async Task AddAsync(FriendshipRequest request, CancellationToken ct)
	{
		await _db.FriendshipRequests.AddAsync(request, ct);
	}

	public async Task RemoveAsync(Guid requestId, CancellationToken ct)
	{
		var entity = await _db.FriendshipRequests.FirstOrDefaultAsync(x => x.Id == requestId, ct);
		if (entity is null) return;
		_db.FriendshipRequests.Remove(entity);
	}
	
	public Task<FriendshipRequest?> GetAsync(Guid requestId, CancellationToken ct)
	{
		return _db.FriendshipRequests.FirstOrDefaultAsync(x => x.Id == requestId, ct);
	}
	
	public async Task SaveChangesAsync(CancellationToken ct)
	{
		await _db.SaveChangesAsync(ct);
	}
	
	
	public	 async Task<IReadOnlyList<FriendshipRequest>> ListIncomingAsync(Guid userId, CancellationToken ct)
	{
		var list = await _db.FriendshipRequests
			.Where(r => r.TargetUserId == userId)
			.OrderByDescending(r => r.CreatedAt)
			.ToListAsync(ct);
		return list;
	}
	
	private static (Guid u1, Guid u2) Normalize(Guid a, Guid b)
		 => a.CompareTo(b) < 0 ? (a, b) : (b, a);

}
