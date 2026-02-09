using Transcendence.Domain.Friends;

namespace Transcendence.Application.Friends.Interfaces;
public interface IFriendRequestRepository
{
	Task<bool> ExistsPendingAsync(Guid requesterId, Guid targetUserId, CancellationToken ct);
	Task AddAsync(FriendshipRequest request, CancellationToken ct);
	Task RemoveAsync(Guid requestId, CancellationToken ct); // decline or cancel
	Task<FriendshipRequest?> GetAsync(Guid requesterId, CancellationToken ct);
	Task<IReadOnlyList<FriendshipRequest>> ListIncomingAsync(Guid userId, CancellationToken ct); // only if needed
	Task SaveChangesAsync(CancellationToken ct);
}
