using Transcendence.Domain.Friends;

namespace Transcendence.Application.Friends.Interfaces;
public interface IFriendshipRequestRepository
{
	//Task<bool> ExistsPendingAsync(Guid requesterId, Guid targetUserId, CancellationToken ct);
	Task<bool> ExistsPendingBetweenAsync(Guid userAId, Guid userBId, CancellationToken ct);
	Task AddAsync(FriendshipRequest request, CancellationToken ct);
	Task RemoveAsync(Guid requestId, CancellationToken ct); // decline or cancel
	Task<FriendshipRequest?> GetAsync(Guid targetUserId, Guid currentUserId, CancellationToken ct);
	Task<IReadOnlyList<FriendshipRequest>> ListIncomingAsync(Guid userId, CancellationToken ct); // only if needed
	Task SaveChangesAsync(CancellationToken ct);
}
