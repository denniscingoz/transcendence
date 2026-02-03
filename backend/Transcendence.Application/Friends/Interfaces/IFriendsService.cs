using Transcendence.Application.Friends.DTOs;

namespace Transcendence.Application.Friends.Interfaces;

public interface IFriendsService // use-case (Command)
{

	Task<Guid> SendFriendshipRequestAsync(Guid requesterId, Guid targetUserId);
	// POST friends/{username}

	Task AcceptFriendshipRequestAsync(Guid requestId, Guid currentUserId);
	// POST friends/requests/{requestId}/accept

	Task DeclineFriendshipRequestAsync(Guid requestId, Guid currentUserId);
	// DELETE friends/requests/{requestId}

	Task<IReadOnlyList<FriendshipRequestDto>> GetFriendshipRequestListAsync(Guid userId);
	// GET friends/requests

	Task RemoveFriendAsync(Guid currentUserId, Guid friendUserId);
	// DELETE friends/{friendUserId}

	Task<IReadOnlyList<FriendDto>> GetFriendsListAsync(Guid userId);
	// GET friends/list
}