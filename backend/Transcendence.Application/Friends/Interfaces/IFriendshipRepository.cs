using Transcendence.Application.Friends.DTOs;
using Transcendence.Domain.Friends;

namespace Transcendence.Application.Friends.Interfaces;

public interface IFriendshipRepository
{
	Task<bool> IsFriendAsync(Guid userAId, Guid userBId);
	Task AddAsync(Friendship friendship);
	Task RemoveAsync(Guid userAId, Guid userBId);
	Task<int> CountByUserIdAsync(Guid userId);
	Task<IReadOnlyList<Guid>> ListFriendsAsync(Guid userId);
}
