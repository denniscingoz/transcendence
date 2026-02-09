using Transcendence.Application.Friends.DTOs;

namespace Transcendence.Application.Friends.Interfaces;

public interface IFriendsService // use-case (Command)
{

	Task<Guid> SendFriendRequestAsync(Guid requesterId, Guid targetUserId, CancellationToken ct);
	// POST friends/{username}

	Task AcceptFriendRequestAsync(Guid requestId, Guid currentUserId, CancellationToken ct);
	// POST friends/requests/{requestId}/accept

	Task DeclineFriendRequestAsync(Guid requestId, Guid currentUserId, CancellationToken ct);
	// DELETE friends/requests/{requestId}

	Task<IReadOnlyList<FriendRequestDto>> GetFriendRequestListAsync(Guid userId, CancellationToken ct);
	// GET friends/requests

	Task RemoveFriendAsync(Guid currentUserId, Guid friendUserId, CancellationToken ct);
	// DELETE friends/{friendUserId}

	Task<IReadOnlyList<FriendDto>> GetFriendsListAsync(Guid userId, CancellationToken ct);
	// GET friends/list
}