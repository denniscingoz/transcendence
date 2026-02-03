using Transcendence.Domain.Friends;

namespace Transcendence.Application.Friends.Interfaces;
public interface IfriendshipRequestRepository
{
	Task<bool> ExistsPendingAsync(Guid requesterId, Guid targetUserId);
	Task AddAsync(FriendshipRequest request);
	Task RemoveAsync(Guid requestId); // decline or cancel
	Task<FriendshipRequest?> GetAsync(Guid requesterId);
	Task<IReadOnlyList<FriendshipRequest>> ListIncomingAsync(Guid userId); // only if needed
}
