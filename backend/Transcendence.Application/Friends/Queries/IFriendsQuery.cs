using Transcendence.Application.Friends.DTOs;

namespace Transcendence.Application.Friends.Queries;
public interface IFriendsQuery
{
	Task<IReadOnlyList<FriendDto>> ListFriendsAsync(Guid userId, CancellationToken ct);
	Task<IReadOnlyList<FriendRequestDto>> ListFriendRequestsAsync(Guid userId, CancellationToken ct);
}
