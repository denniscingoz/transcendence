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

    public Task<bool> ExistsPendingAsync(Guid requesterId, Guid targetUserId)
    {
        // You currently have no Status field, so "exists" == "pending".
        return _db.FriendshipRequests.AnyAsync(x =>
            x.RequesterId == requesterId && x.TargetUserId == targetUserId);
    }

    public async Task AddAsync(FriendshipRequest request)
    {
        await _db.FriendshipRequests.AddAsync(request);
    }

    public Task<FriendshipRequest?> GetAsync(Guid requestId)
    {
        return _db.FriendshipRequests.FirstOrDefaultAsync(x => x.Id == requestId);
    }

    public async Task RemoveAsync(Guid requestId)
    {
        var entity = await _db.FriendshipRequests.FirstOrDefaultAsync(x => x.Id == requestId);
        if (entity is null) return;
        _db.FriendshipRequests.Remove(entity);
    }
	
	public	 async Task<IReadOnlyList<FriendshipRequest>> ListIncomingAsync(Guid userId)
	{
		var list = await _db.FriendshipRequests
        	.Where(r => r.TargetUserId == userId)
        	.OrderByDescending(r => r.CreatedAt)
        	.ToListAsync();
    	return list;
	}

}
