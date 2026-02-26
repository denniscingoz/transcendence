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
	private readonly IFriendshipRequestRepository _friendshipRequestRepository;
	private readonly IFriendsQuery _friendsQuery;

	public FriendsService(IFriendshipRepository friendshipRepository, 
						IFriendshipRequestRepository friendshipRequestRepository,
						IUserRepository userRepository,
						IFriendsQuery friendsQuery)
	{
		_friendshipRequestRepository = friendshipRequestRepository;
		_friendshipRepository = friendshipRepository;
		_userRepository = userRepository;
		_friendsQuery = friendsQuery;
	}

	// POST friends/{username}
	public async Task<Guid> SendFriendshipRequestAsync(Guid requesterId, Guid targetUserId)
	{
		if (requesterId == targetUserId) throw new CannotFriendYourselfException();

		_ = await _userRepository.GetByIdAsync(requesterId) ?? throw new NotFoundException("Requester not found.");
		_ = await _userRepository.GetByIdAsync(targetUserId) ?? throw new NotFoundException("Target user not found.");

		if (await _friendshipRepository.IsFriendAsync(requesterId, targetUserId))
			throw new AlreadyFriendsException();

		if (await _friendshipRequestRepository.ExistsPendingAsync(requesterId, targetUserId) ||
			await _friendshipRequestRepository.ExistsPendingAsync(targetUserId, requesterId))
			throw new FriendshipRequestAlreadyExistsException();

		var requestId = Guid.NewGuid();
		var request = new FriendshipRequest(requestId, requesterId, targetUserId, DateTime.UtcNow);
		await _friendshipRequestRepository.AddAsync(request);

		return requestId;
	}

	// POST friends/requests/{requestId}/accept
	public async Task AcceptFriendshipRequestAsync(Guid requestId, Guid currentUserId)
	{
		var request = await _friendshipRequestRepository.GetAsync(requestId)
			?? throw new NotFoundException("Friend request not found.");
		
		if (request.TargetUserId != currentUserId)
			throw new NotAllowedToFriendException("You cannot accept this friend request.");

		if (await _friendshipRepository.IsFriendAsync(request.RequesterId, request.TargetUserId))
		{
			await _friendshipRequestRepository.RemoveAsync(requestId); // cleanup
			return;
		}

		var friendship = new Friendship(request.RequesterId, request.TargetUserId, DateTime.UtcNow);
		await _friendshipRepository.AddAsync(friendship);
		await _friendshipRequestRepository.RemoveAsync(requestId);
	}

	// DELETE friends/requests/{requestId}
	public async Task DeclineFriendshipRequestAsync(Guid requestId, Guid currentUserId)
	{
		var request = await _friendshipRequestRepository.GetAsync(requestId)
			?? throw new NotFoundException("Friend request not found.");
		if (request.TargetUserId != currentUserId)
			throw new NotAllowedToFriendException("You cannot decline this friend request.");
		await _friendshipRequestRepository.RemoveAsync(requestId);
	}

	// GET friends/requests
	public async Task<IReadOnlyList<FriendshipRequestDto>> GetFriendshipRequestListAsync(Guid userId)
	{
		_ = await _userRepository.GetByIdAsync(userId) ?? throw new NotFoundException("User not found.");
		var list = await _friendsQuery.ListFriendshipRequestsAsync(userId);
		return list;
	}

	// DELETE friends/{friendUserId}
	public async Task RemoveFriendAsync(Guid currentUserId, Guid friendUserId)
	{
		_ = await _userRepository.GetByIdAsync(friendUserId) ?? throw new NotFoundException("Friend user not found.");
		if (!await _friendshipRepository.IsFriendAsync(currentUserId, friendUserId))
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