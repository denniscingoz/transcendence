using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Exceptions;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.Friends.Queries;
using Transcendence.Domain.Exceptions;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Users;
using Transcendence.Application.Realtime.Contracts;

using NotFoundException = Transcendence.Application.Common.Exceptions.NotFoundException;

namespace Transcendence.Application.Friends.Services;

public sealed class FriendsService : IFriendsService // use-case (Command)
{
	private readonly IFriendshipRepository _friendshipRepository;
	private readonly IUserRepository _userRepository;
	private readonly IFriendshipRequestRepository _friendshipRequestRepository;
	private readonly IFriendsQuery _friendsQuery;
	private readonly INotificationService _notificationService;

	public FriendsService(IFriendshipRepository friendshipRepository, 
						IFriendshipRequestRepository friendshipRequestRepository,
						IUserRepository userRepository,
						IFriendsQuery friendsQuery,
						INotificationService notificationService
						)
						
	{
		_friendshipRequestRepository = friendshipRequestRepository;
		_friendshipRepository = friendshipRepository;
		_userRepository = userRepository;
		_friendsQuery = friendsQuery;
		_notificationService = notificationService;
	}

	// POST friends/{username}
	public async Task<Guid> SendFriendshipRequestAsync(Guid requesterId, Guid targetUserId, CancellationToken ct)
	{
		if (requesterId == targetUserId) throw new CannotFriendYourselfException();

		_ = await _userRepository.GetByIdAsync(requesterId, ct) ?? throw new NotFoundException("Requester not found.");
		_ = await _userRepository.GetByIdAsync(targetUserId, ct) ?? throw new NotFoundException("Target user not found.");

		if (await _friendshipRepository.IsFriendAsync(requesterId, targetUserId, ct))
			throw new AlreadyFriendsException();

		if (await _friendshipRequestRepository.ExistsPendingBetweenAsync(requesterId, targetUserId, ct))
			throw new FriendshipRequestAlreadyExistsException();

		var requestId = Guid.NewGuid();
		var request = new FriendshipRequest(requestId, requesterId, targetUserId, DateTime.UtcNow);
		await _friendshipRequestRepository.AddAsync(request, ct);
		await _friendshipRequestRepository.SaveChangesAsync(ct);
		var requestDto = new FriendshipRequestDto
		{
			Id = request.Id, RequesterId = request.RequesterId,
			CreatedAt = request.CreatedAt, TargetUserId = request.TargetUserId
		} ;
		await _notificationService.NotifyFriendRequest(requesterId, requestDto);
		return requestId;
	}

	// POST friends/requests/{targetUserId}/accept
	public async Task AcceptFriendshipRequestAsync(Guid targetUserId, Guid currentUserId, CancellationToken ct)
	{
		var request = await _friendshipRequestRepository.GetAsync(targetUserId, currentUserId, ct)
			?? throw new NotFoundException("Friend request not found.");
		
		if (request.TargetUserId != currentUserId)
			throw new NotAllowedToFriendException("You cannot accept this friend request.");

		if (await _friendshipRepository.IsFriendAsync(request.RequesterId, request.TargetUserId, ct))
		{
			await _friendshipRequestRepository.RemoveAsync(request.Id, ct); // cleanup
			return;
		}

		var friendship = new Friendship(request.RequesterId, request.TargetUserId, DateTime.UtcNow);
		await _friendshipRepository.AddAsync(friendship, ct);
		await _friendshipRequestRepository.RemoveAsync(request.Id, ct);
		await _friendshipRepository.SaveChangesAsync(ct);// Save both changes in one transaction.
		// await _notificationService.NotifyFriendAccept(requesterId, requestDto);	
	}

	// DELETE friends/requests/{targetUserId}
	public async Task DeclineFriendshipRequestAsync(Guid targetUserId, Guid currentUserId, CancellationToken ct)
	{
		var request = await _friendshipRequestRepository.GetAsync(targetUserId, currentUserId, ct)
			?? throw new NotFoundException("Friend request not found.");
		if (request.TargetUserId != currentUserId)
			throw new NotAllowedToFriendException("You cannot decline this friend request.");
		await _friendshipRequestRepository.RemoveAsync(request.Id, ct);
		await _friendshipRequestRepository.SaveChangesAsync(ct);
	}

	// GET friends/requests
	public async Task<IReadOnlyList<FriendshipRequestDto>> GetFriendshipRequestListAsync(Guid userId, CancellationToken ct)
	{
		_ = await _userRepository.GetByIdAsync(userId, ct) ?? throw new NotFoundException("User not found.");
		var list = await _friendsQuery.ListFriendshipRequestsAsync(userId, ct);
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