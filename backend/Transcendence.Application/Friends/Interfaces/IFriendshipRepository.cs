using Transcendence.Application.Friends.DTOs;
using Transcendence.Domain.Friends;

namespace Transcendence.Application.Friends.Interfaces;

public interface IFriendshipRepository
{
	Task<bool> IsFriendAsync(Guid userAId, Guid userBId, CancellationToken ct);
	Task AddAsync(Friendship friendship, CancellationToken ct);
	Task RemoveAsync(Guid userAId, Guid userBId, CancellationToken ct);
	Task<int> CountFriendsAsync(Guid userId, CancellationToken ct);
	Task<IReadOnlyList<Guid>> ListFriendsAsync(Guid userId, CancellationToken ct);
	Task SaveChangesAsync(CancellationToken ct);

}