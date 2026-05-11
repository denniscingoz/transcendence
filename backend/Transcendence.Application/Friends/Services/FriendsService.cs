using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Exceptions;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Friends.Queries;
using Transcendence.Application.Notifications.Interfaces;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Domain.Exceptions;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Users;

using NotFoundException = Transcendence.Application.Common.Exceptions.NotFoundException;

namespace Transcendence.Application.Friends.Services;

public sealed class FriendsService : IFriendsService
{
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFriendshipRequestRepository _friendshipRequestRepository;
    private readonly IFriendsQuery _friendsQuery;
    private readonly INotificationService _notificationService;      // realtime
    private readonly INotificationsService _notificationsService;    // database

    public FriendsService(
        IFriendshipRepository friendshipRepository,
        IFriendshipRequestRepository friendshipRequestRepository,
        IUserRepository userRepository,
        IFriendsQuery friendsQuery,
        INotificationService notificationService,
        INotificationsService notificationsService)
    {
        _friendshipRequestRepository = friendshipRequestRepository;
        _friendshipRepository = friendshipRepository;
        _userRepository = userRepository;
        _friendsQuery = friendsQuery;
        _notificationService = notificationService;
        _notificationsService = notificationsService;
    }

    // POST friends/{targetUserId}
    public async Task<Guid> SendFriendshipRequestAsync(Guid requesterId, Guid targetUserId, CancellationToken ct)
    {
        if (requesterId == targetUserId)
            throw new CannotFriendYourselfException();

        var requester = await _userRepository.GetByIdAsync(requesterId, ct)
            ?? throw new NotFoundException("Requester not found.");

        _ = await _userRepository.GetByIdAsync(targetUserId, ct)
            ?? throw new NotFoundException("Target user not found.");

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
            Id = request.Id,
            RequesterId = request.RequesterId,
            TargetUserId = request.TargetUserId,
            CreatedAt = request.CreatedAt
        };

 
        await _notificationService.NotifyFriendRequest(targetUserId, requestDto);
        await _notificationService.NotifyChange(targetUserId);

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
            await _friendshipRequestRepository.RemoveAsync(request.Id, ct);
            return;
        }

        var currentUser = await _userRepository.GetByIdAsync(currentUserId, ct)
            ?? throw new NotFoundException("Current user not found.");

        var friendship = new Friendship(request.RequesterId, request.TargetUserId, DateTime.UtcNow);

        await _friendshipRepository.AddAsync(friendship, ct);
        // Persist the new friendship now so notifications can be created
        // while the original friendship request still exists.
        await _friendshipRepository.SaveChangesAsync(ct);

        var requestDto = new FriendshipRequestDto
        {
            Id = request.Id,
            RequesterId = request.RequesterId,
            TargetUserId = request.TargetUserId,
            CreatedAt = request.CreatedAt
        };

        // Notify BEFORE removing the friendship request to avoid orphaning
        // notifications that reference a deleted FriendshipRequest.
        await _notificationService.NotifyFriendRequestAccepted(request.RequesterId, requestDto);
        await _notificationService.NotifyChange(request.RequesterId);

        // Now remove the request and persist the deletion.
        await _friendshipRequestRepository.RemoveAsync(request.Id, ct);
        await _friendshipRequestRepository.SaveChangesAsync(ct);
    }

    // POST friends/requests/{targetUserId}/decline
    public async Task DeclineFriendshipRequestAsync(Guid targetUserId, Guid currentUserId, CancellationToken ct)
    {
        var request = await _friendshipRequestRepository.GetAsync(targetUserId, currentUserId, ct)
            ?? throw new NotFoundException("Friend request not found.");

        if (request.TargetUserId != currentUserId)
            throw new NotAllowedToFriendException("You cannot decline this friend request.");

        var currentUser = await _userRepository.GetByIdAsync(currentUserId, ct)
            ?? throw new NotFoundException("Current user not found.");

        var requestDto = new FriendshipRequestDto
        {
            Id = request.Id,
            RequesterId = request.RequesterId,
            TargetUserId = request.TargetUserId,
            CreatedAt = request.CreatedAt
        };

        // Notify before deleting the request to keep RelatedRequestId valid.
        await _notificationService.NotifyFriendRequestDeclined(request.RequesterId, requestDto);
        await _notificationService.NotifyChange(request.RequesterId);

        await _friendshipRequestRepository.RemoveAsync(request.Id, ct);
        await _friendshipRequestRepository.SaveChangesAsync(ct);
    }

    // GET friends/requests
    public async Task<IReadOnlyList<FriendshipRequestDto>> GetFriendshipRequestListAsync(Guid userId, CancellationToken ct)
    {
        _ = await _userRepository.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("User not found.");

        var list = await _friendsQuery.ListFriendshipRequestsAsync(userId, ct);
        return list;
    }

    // DELETE friends/{friendUserId}
    public async Task RemoveFriendAsync(Guid currentUserId, Guid friendUserId, CancellationToken ct)
    {
        _ = await _userRepository.GetByIdAsync(friendUserId, ct)
            ?? throw new NotFoundException("Friend user not found.");

        if (!await _friendshipRepository.IsFriendAsync(currentUserId, friendUserId, ct))
            throw new NotFriendsException();

        await _friendshipRepository.RemoveAsync(currentUserId, friendUserId, ct);
        await _friendshipRepository.SaveChangesAsync(ct);
    }

	// GET friends/list
	public async Task<CursorPageDto<FriendDto>> GetFriendsListAsync(
		Guid userId,
		int take,
		string? cursor,
		CancellationToken ct)
	{
		// Validate page size once in the service.
		take = (take < 1 || take > 50) ? 20 : take;

		// Make sure the authenticated user still exists.
		_ = await _userRepository.GetByIdAsync(userId, ct)
			?? throw new NotFoundException("User not found.");

		// Repository/query layer handles cursor pagination.
		var list = await _friendsQuery.ListFriendsAsync(userId, take, cursor, ct);

		return list;
	}
} 