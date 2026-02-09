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
	public async Task<Guid> SendFriendRequestAsync(Guid requesterId, Guid targetUserId, CancellationToken ct)
	{
		if (requesterId == targetUserId) throw new CannotFriendYourselfException();

		_ = await _userRepository.GetByIdAsync(requesterId, ct) ?? throw new NotFoundException("Requester not found.");
		_ = await _userRepository.GetByIdAsync(targetUserId, ct) ?? throw new NotFoundException("Target user not found.");

		if (await _friendshipRepository.IsFriendAsync(requesterId, targetUserId, ct))
			throw new AlreadyFriendsException();

		if (await _friendRequestRepository.ExistsPendingAsync(requesterId, targetUserId, ct) ||
			await _friendRequestRepository.ExistsPendingAsync(targetUserId, requesterId, ct))
			throw new FriendRequestAlreadyExistsException();

		var requestId = Guid.NewGuid();
		var request = new FriendshipRequest(requestId, requesterId, targetUserId, DateTime.UtcNow);
		await _friendRequestRepository.AddAsync(request, ct);
		await _friendRequestRepository.SaveChangesAsync(ct);

		return requestId;
	}

	// POST friends/requests/{requestId}/accept
	public async Task AcceptFriendRequestAsync(Guid requestId, Guid currentUserId, CancellationToken ct)
	{
		var request = await _friendRequestRepository.GetAsync(requestId, ct)
			?? throw new NotFoundException("Friend request not found.");
		
		if (request.TargetUserId != currentUserId)
			throw new NotAllowedToFriendException("You cannot accept this friend request.");

		if (await _friendshipRepository.IsFriendAsync(request.RequesterId, request.TargetUserId, ct))
		{
			await _friendRequestRepository.RemoveAsync(requestId, ct); // cleanup
			return;
		}

		var friendship = new Friendship(request.RequesterId, request.TargetUserId, DateTime.UtcNow);
		await _friendshipRepository.AddAsync(friendship, ct);
		await _friendshipRepository.SaveChangesAsync(ct);
		await _friendRequestRepository.RemoveAsync(requestId, ct);
		await _friendRequestRepository.SaveChangesAsync(ct);
	}

	// DELETE friends/requests/{requestId}
	public async Task DeclineFriendRequestAsync(Guid requestId, Guid currentUserId, CancellationToken ct)
	{
		var request = await _friendRequestRepository.GetAsync(requestId, ct)
			?? throw new NotFoundException("Friend request not found.");
		if (request.TargetUserId != currentUserId)
			throw new NotAllowedToFriendException("You cannot decline this friend request.");
		await _friendRequestRepository.RemoveAsync(requestId, ct);
		await _friendRequestRepository.SaveChangesAsync(ct);
	}

	// GET friends/requests
	public async Task<IReadOnlyList<FriendRequestDto>> GetFriendRequestListAsync(Guid userId, CancellationToken ct)
	{
		_ = await _userRepository.GetByIdAsync(userId, ct) ?? throw new NotFoundException("User not found.");
		var list = await _friendsQuery.ListFriendRequestsAsync(userId, ct);
		return list;
	}

	// DELETE friends/{friendUserId}
	public async Task RemoveFriendAsync(Guid currentUserId, Guid friendUserId, CancellationToken ct)
	{
		_ = await _userRepository.GetByIdAsync(friendUserId, ct) ?? throw new NotFoundException("Friend user not found.");
		if (!await _friendshipRepository.IsFriendAsync(currentUserId, friendUserId, ct))
			throw new NotFriendsException();
		await _friendshipRepository.RemoveAsync(currentUserId, friendUserId, ct);
		await _friendshipRepository.SaveChangesAsync(ct);
	}

	// GET friends/list
	public async Task<IReadOnlyList<FriendDto>> GetFriendsListAsync(Guid userId, CancellationToken ct)
	{
		_ = await _userRepository.GetByIdAsync(userId, ct) ?? throw new NotFoundException("User not found.");
		var list = await _friendsQuery.ListFriendsAsync(userId, ct);
		return list;
	}
}