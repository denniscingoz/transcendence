using Transcendence.Application.Friends.Interfaces;
using Transcendence.Infrastructure.Persistence;
using Transcendence.Domain.Friends;

namespace Transcendence.Infrastructure.Repositories;
public sealed class FriendRequestRepository : IFriendRequestRepository
{
	private readonly TranscendenceDbContext _dbContext;
	public FriendRequestRepository(TranscendenceDbContext dbContext)
	{
		_dbContext = dbContext;
	}
	public async Task<bool> ExistsPendingAsync(Guid requesterId, Guid targetUserId, CancellationToken ct)				   
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task AddAsync(FriendshipRequest request, CancellationToken ct)										   
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task RemoveAsync(Guid requestId, CancellationToken ct) // decline or cancel								   
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task<FriendshipRequest?> GetAsync(Guid requesterId, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task SaveChangesAsync(CancellationToken ct)															   
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task<IReadOnlyList<FriendshipRequest>> ListIncomingAsync(Guid userId, CancellationToken ct) // only if needed
	{
		throw new NotImplementedException("Should be implemented");
	}
}
