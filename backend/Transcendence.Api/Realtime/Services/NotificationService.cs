using Microsoft.AspNetCore.SignalR;
using Transcendence.Api.Realtime.Hubs;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Application.Users.Interfaces;

namespace Transcendence.Api.Realtime.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<ChatHub, IRealtimeClient> _hub;
    private readonly IUserRepository _userRepository;

    public NotificationService(
        IHubContext<ChatHub, IRealtimeClient> hub,
        IUserRepository userRepository)
    {
        _hub = hub;
        _userRepository = userRepository;
    }

    public async Task NotifyNewMessage(
        IEnumerable<Guid> participants,
        Guid senderId,
        ChatMessageDto message)
    {
        var groups = participants
            .Where(p => p != senderId)
            .Select(GroupNames.User)
            .ToList();

        await _hub.Clients
            .Groups(groups)
            .NotificationReceived(NotificationDto.NewMessage(message));

        Console.WriteLine(
            $"Notify message {message.MessageId} to {string.Join(",", groups)}");
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

        await _hub.Clients
            .Group(GroupNames.User(targetUserId))
            .NotificationReceived(NotificationDto.FriendRequest(eventDto));
    }

    public async Task NotifyFriendRequestAccepted(Guid targetUserId, FriendshipRequestDto request)
    {
        var eventDto = await BuildFriendshipRequestEventDto(
            request,
            FriendshipRequestStatus.Accepted);

        await _hub.Clients
            .Group(GroupNames.User(targetUserId))
            .NotificationReceived(NotificationDto.FriendRequestAccepted(eventDto));
    }

    public async Task NotifyFriendRequestDeclined(Guid targetUserId, FriendshipRequestDto request)
    {
        var eventDto = await BuildFriendshipRequestEventDto(
            request,
            FriendshipRequestStatus.Declined);

        await _hub.Clients
            .Group(GroupNames.User(targetUserId))
            .NotificationReceived(NotificationDto.FriendRequestDeclined(eventDto));
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
}