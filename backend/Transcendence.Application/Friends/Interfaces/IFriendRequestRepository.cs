using Transcendence.Domain.Friends;

namespace Transcendence.Application.Friends.Interfaces;
public interface IFriendRequestRepository
{
	Task<bool> ExistsPendingAsync(Guid requesterId, Guid targetUserId);
	Task AddAsync(FriendRequest request);
	Task RemoveAsync(Guid requestId); // decline or cancel
	Task<FriendRequest?> GetAsync(Guid requesterId);
	Task<IReadOnlyList<FriendRequest>> ListIncomingAsync(Guid userId); // only if needed
}
