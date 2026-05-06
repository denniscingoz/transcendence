using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Application.Friends.Queries;
public interface IFriendsQuery
{
	Task<CursorPageDto<FriendDto>> ListFriendsAsync(Guid userId, int take, string? cursor, CancellationToken ct);
	Task<IReadOnlyList<FriendshipRequestDto>> ListFriendshipRequestsAsync(Guid userId,  CancellationToken ct);
}