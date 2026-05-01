using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Common.DTOs;

namespace Transcendence.Application.Friends.Interfaces;

public interface IFriendsService // use-case (Command)
{

	Task<Guid> SendFriendshipRequestAsync(Guid requesterId, Guid targetUserId, CancellationToken ct);
	// POST friends/{username}

	Task AcceptFriendshipRequestAsync(Guid requestId, Guid currentUserId, CancellationToken ct);
	// POST friends/requests/{requestId}/accept

	Task DeclineFriendshipRequestAsync(Guid requestId, Guid currentUserId, CancellationToken ct);
	// DELETE friends/requests/{requestId}

	Task<IReadOnlyList<FriendshipRequestDto>> GetFriendshipRequestListAsync(Guid userId, CancellationToken ct);
	// GET friends/requests

	Task RemoveFriendAsync(Guid currentUserId, Guid friendUserId, CancellationToken ct);
	// DELETE friends/{friendUserId}

	Task<CursorPageDto<FriendDto>> GetFriendsListAsync(Guid userId, int take, string? cursor, CancellationToken ct);
	// GET friends/list
}