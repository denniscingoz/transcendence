using Microsoft.AspNetCore.SignalR;
using Transcendence.Api.Realtime.Hubs;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.Notifications.Interfaces;
using Transcendence.Domain.Notifications;



namespace Transcendence.Api.Realtime.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<ChatHub, IRealtimeClient> _hub;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    public NotificationService(
        IHubContext<ChatHub, IRealtimeClient> hub,
        IUserRepository userRepository,
        INotificationRepository notificationRepository)
    {
        _hub = hub;
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
    }

   public async Task NotifyNewMessage(
    IEnumerable<Guid> participants,
    Guid senderId,
    ChatMessageDto message)
    {
        var sender = await _userRepository.GetByIdAsync(senderId, CancellationToken.None);

        var recipients = participants
            .Where(p => p != senderId)
            .Distinct()
            .ToList();

        foreach (var userId in recipients)
        {
            await SaveNotificationAsync(
                userId: userId,
                type: NotificationType.NewMessage,
                text: $"{sender?.Username} sent you a message: " + message.Content,
                actorUserId: senderId,
                actorUsername: sender?.Username,
                actorAvatarUrl: sender?.AvatarFileId.HasValue == true
                    ? $"/files/avatar/{sender.AvatarFileId.Value}"
                    : null,
                relatedConversationId: message.ConversationId
            );
        }

        var groups = recipients.Select(GroupNames.User).ToList();

        await _hub.Clients
            .Groups(groups)
            .NotificationReceived(NotificationDto.NewMessage(message));

        foreach (var userId in recipients)
        {
            await NotifyChange(userId);
        }
    }
    public async Task NotifyChange(Guid userId)
    {
        await _hub.Clients
            .Group(GroupNames.User(userId))
            .NotificationsChanged();
    }

    public async Task NotifyFriendRequest(Guid targetUserId, FriendshipRequestDto request)
    {
        var eventDto = await BuildFriendshipRequestEventDto(
            request,
            FriendshipRequestStatus.Pending);

        await SaveNotificationAsync(
            userId: targetUserId,
            type: NotificationType.FriendRequest,
            text: $"{eventDto.RequesterUsername} sent you a friend request",
            actorUserId: request.RequesterId,
            actorUsername: eventDto.RequesterUsername,
            actorAvatarUrl: eventDto.RequesterAvatarUrl,
            relatedRequestId: request.Id
        );

        await _hub.Clients
            .Group(GroupNames.User(targetUserId))
            .NotificationReceived(NotificationDto.FriendRequest(eventDto));

        await NotifyChange(targetUserId);
    }
    public async Task NotifyFriendRequestAccepted(Guid targetUserId, FriendshipRequestDto request)
    {
        var accepter = await _userRepository.GetByIdAsync(request.TargetUserId, CancellationToken.None);

        var eventDto = new FriendshipRequestEventDto
        {
            RequestId = request.Id,
            RequesterId = request.RequesterId,
            TargetUserId = request.TargetUserId,
            Status = FriendshipRequestStatus.Accepted,
            CreatedAt = request.CreatedAt,
            RequesterUsername = accepter?.Username ?? request.TargetUserId.ToString(),
            RequesterAvatarUrl = accepter?.AvatarFileId.HasValue == true
                ? $"/files/avatar/{accepter.AvatarFileId.Value}"
                : null
        };

        await SaveNotificationAsync(
            userId: targetUserId,
            type: NotificationType.FriendRequestAccepted,
            text: $"{eventDto.RequesterUsername} accepted your friend request",
            actorUserId: request.TargetUserId,
            actorUsername: eventDto.RequesterUsername,
            actorAvatarUrl: eventDto.RequesterAvatarUrl,
            relatedRequestId: request.Id
        );

        await _hub.Clients
            .Group(GroupNames.User(targetUserId))
            .NotificationReceived(NotificationDto.FriendRequestAccepted(eventDto));

        await NotifyChange(targetUserId);
    }
    public async Task NotifyFriendRequestDeclined(Guid targetUserId, FriendshipRequestDto request)
    {
        var decliner = await _userRepository.GetByIdAsync(request.TargetUserId, CancellationToken.None);

        var eventDto = new FriendshipRequestEventDto
        {
            RequestId = request.Id,
            RequesterId = request.RequesterId,
            TargetUserId = request.TargetUserId,
            Status = FriendshipRequestStatus.Declined,
            CreatedAt = request.CreatedAt,
            RequesterUsername = decliner?.Username ?? request.TargetUserId.ToString(),
            RequesterAvatarUrl = decliner?.AvatarFileId.HasValue == true
                ? $"/files/avatar/{decliner.AvatarFileId.Value}"
                : null
        };

        await SaveNotificationAsync(
            userId: targetUserId,
            type: NotificationType.FriendRequestDeclined,
            text: $"{eventDto.RequesterUsername} declined your friend request",
            actorUserId: request.TargetUserId,
            actorUsername: eventDto.RequesterUsername,
            actorAvatarUrl: eventDto.RequesterAvatarUrl,
            relatedRequestId: request.Id
        );

        await _hub.Clients
            .Group(GroupNames.User(targetUserId))
            .NotificationReceived(NotificationDto.FriendRequestDeclined(eventDto));

        await NotifyChange(targetUserId);
    }
    public async Task NotifyConversationCreated(Guid userA, Guid userB, Guid conversationId)
    {
        var groups = new[]
        {
            GroupNames.User(userA),
            GroupNames.User(userB)
        };

        await _hub.Clients
            .Groups(groups)
            .ConversationsChanged();
    }

    private async Task<FriendshipRequestEventDto> BuildFriendshipRequestEventDto(
        FriendshipRequestDto request,
        FriendshipRequestStatus status)
    {
        var requester = await _userRepository.GetByIdAsync(request.RequesterId, CancellationToken.None);

        return new FriendshipRequestEventDto 
        {
            RequestId = request.Id,
            RequesterId = request.RequesterId,
            TargetUserId = request.TargetUserId,
            Status = status,
            CreatedAt = request.CreatedAt,
            RequesterUsername = requester?.Username ?? request.RequesterId.ToString(),
            RequesterAvatarUrl = requester?.AvatarFileId.HasValue == true
                ? $"/files/avatar/{requester.AvatarFileId.Value}"
                : null
        };
    }
    private async Task SaveNotificationAsync(
    Guid userId,
    NotificationType type,
    string text,
    Guid? actorUserId = null,
    string? actorUsername = null,
    string? actorAvatarUrl = null,
    Guid? relatedConversationId = null,
    Guid? relatedRequestId = null)
    {
        var notification = new Notification(
            id: Guid.NewGuid(),
            userId: userId,
            type: (int)type,
            text: text,
            createdAt: DateTime.UtcNow,
            actorUserId: actorUserId,
            actorUsername: actorUsername,
            actorAvatarUrl: actorAvatarUrl,
            relatedConversationId: relatedConversationId,
            relatedRequestId: relatedRequestId
        );

        await _notificationRepository.AddAsync(notification, CancellationToken.None);
        await _notificationRepository.SaveChangesAsync(CancellationToken.None);
    }

}