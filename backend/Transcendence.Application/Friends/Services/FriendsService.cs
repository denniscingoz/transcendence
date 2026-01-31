using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Exceptions;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.Friends.Queries;
using Transcendence.Domain.Exceptions;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Users;

namespace Transcendence.Application.Friends.Services;

public sealed class FriendsService : IFriendsService // use-case (Command)
{
	private readonly IFriendshipRepository _friendshipRepository;
	private readonly IUserRepository _userRepository;
	private readonly IFriendRequestRepository _friendRequestRepository;
	private readonly IFriendsQuery _friendsQuery;

	public FriendsService(IFriendshipRepository friendshipRepository, 
						IFriendRequestRepository friendRequestRepository,
						IUserRepository userRepository,
						IFriendsQuery friendsQuery)
	{
		_friendRequestRepository = friendRequestRepository;
		_friendshipRepository = friendshipRepository;
		_userRepository = userRepository;
		_friendsQuery = friendsQuery;
	}

	// POST friends/{username}
	public async Task<Guid> SendFriendRequestAsync(Guid requesterId, Guid targetUserId)
	{
		if (requesterId == targetUserId) throw new CannotFriendYourselfException();

		_ = await _userRepository.GetByIdAsync(requesterId) ?? throw new NotFoundException("Requester not found.");
		_ = await _userRepository.GetByIdAsync(targetUserId) ?? throw new NotFoundException("Target user not found.");

		if (await _friendshipRepository.ExistsAsync(requesterId, targetUserId))
			throw new AlreadyFriendsException();

		if (await _friendRequestRepository.ExistsPendingAsync(requesterId, targetUserId) ||
			await _friendRequestRepository.ExistsPendingAsync(targetUserId, requesterId))
			throw new FriendRequestAlreadyExistsException();

		var requestId = Guid.NewGuid();
		var request = new FriendRequest(requestId, requesterId, targetUserId, DateTime.UtcNow);
		await _friendRequestRepository.AddAsync(request);

		return requestId;
	}

	// POST friends/requests/{requestId}/accept
	public async Task AcceptFriendRequestAsync(Guid requestId, Guid currentUserId)
	{
		var request = await _friendRequestRepository.GetAsync(requestId)
			?? throw new NotFoundException("Friend request not found.");
		
		if (request.TargetUserId != currentUserId)
			throw new NotAllowedToFriendException("You cannot accept this friend request.");

		if (await _friendshipRepository.ExistsAsync(request.RequesterId, request.TargetUserId))
		{
			await _friendRequestRepository.RemoveAsync(requestId); // cleanup
			return;
		}

		var friendship = new Friendship(request.RequesterId, request.TargetUserId, DateTime.UtcNow);
		await _friendshipRepository.AddAsync(friendship);
		await _friendRequestRepository.RemoveAsync(requestId);
	}

	// DELETE friends/requests/{requestId}
	public async Task DeclineFriendRequestAsync(Guid requestId, Guid currentUserId)
	{
		var request = await _friendRequestRepository.GetAsync(requestId)
			?? throw new NotFoundException("Friend request not found.");
		if (request.TargetUserId != currentUserId)
			throw new NotAllowedToFriendException("You cannot decline this friend request.");
		await _friendRequestRepository.RemoveAsync(requestId);
	}

	// GET friends/requests
	public async Task<IReadOnlyList<FriendRequestDto>> GetFriendRequestListAsync(Guid userId)
	{
		_ = await _userRepository.GetByIdAsync(userId) ?? throw new NotFoundException("User not found.");
		var list = await _friendsQuery.ListFriendRequestsAsync(userId);
		return list;
	}

	// DELETE friends/{friendUserId}
	public async Task RemoveFriendAsync(Guid currentUserId, Guid friendUserId)
	{
		_ = await _userRepository.GetByIdAsync(friendUserId) ?? throw new NotFoundException("Friend user not found.");
		if (!await _friendshipRepository.ExistsAsync(currentUserId, friendUserId))
			throw new NotFriendsException();
		await _friendshipRepository.RemoveAsync(currentUserId, friendUserId);
	}

	// GET friends/list
	public async Task<IReadOnlyList<FriendDto>> GetFriendsListAsync(Guid userId)
	{
		_ = await _userRepository.GetByIdAsync(userId) ?? throw new NotFoundException("User not found.");
		var list = await _friendsQuery.ListFriendsAsync(userId);
		return list;
	}
}