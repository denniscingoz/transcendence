using Transcendence.Application.Friends.DTOs;

namespace Transcendence.Application.Friends.Interfaces;

public interface IFriendsService // use-case (Command)
{

	Task<Guid> SendFriendRequestAsync(Guid requesterId, Guid targetUserId);
	// POST friends/{username}

	Task AcceptFriendRequestAsync(Guid requestId, Guid currentUserId);
	// POST friends/requests/{requestId}/accept

	Task DeclineFriendRequestAsync(Guid requestId, Guid currentUserId);
	// DELETE friends/requests/{requestId}

	Task<IReadOnlyList<FriendRequestDto>> GetFriendRequestListAsync(Guid userId);
	// GET friends/requests

	Task RemoveFriendAsync(Guid currentUserId, Guid friendUserId);
	// DELETE friends/{friendUserId}

	Task<IReadOnlyList<FriendDto>> GetFriendsListAsync(Guid userId);
	// GET friends/list
}