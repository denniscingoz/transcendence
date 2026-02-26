using Transcendence.Domain.Friends;

namespace Transcendence.Application.Friends.Interfaces;
public interface IFriendshipRequestRepository
{
	Task<bool> ExistsPendingAsync(Guid requesterId, Guid targetUserId);
	Task AddAsync(FriendshipRequest request);
	Task RemoveAsync(Guid requestId); // decline or cancel
	Task<FriendshipRequest?> GetAsync(Guid requestId);//if reuesterId, would mean: Give me some request created by this user - wrong
	Task<IReadOnlyList<FriendshipRequest>> ListIncomingAsync(Guid userId); // only if needed
}
