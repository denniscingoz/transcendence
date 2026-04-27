namespace Transcendence.Application.Chat.DTOs;

public enum NotificationType
{
    NewMessage = 1,
    FriendRequest = 2,
    FriendRequestAccepted = 3,
    FriendRequestDeclined = 4
}
public sealed class NotificationDto
{
    public Guid Id { get; init; }
    public NotificationType Type { get; init; } = default!;
    public object Payload { get; init; } = default!;
    public DateTimeOffset CreatedAt { get; init; }

    public static NotificationDto NewMessage(ChatMessageDto message)
    {
        return new NotificationDto
        {
            Id = Guid.NewGuid(),
            Type = NotificationType.NewMessage,
            Payload = message,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
    public static NotificationDto FriendRequest(FriendshipRequestEventDto dto)
    {
        return new NotificationDto
        {
            Id = Guid.NewGuid(),
            Type = NotificationType.FriendRequest,
            Payload = dto,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public static NotificationDto FriendRequestAccepted(FriendshipRequestEventDto dto)
    {
        return new NotificationDto
        {
            Id = Guid.NewGuid(),
            Type = NotificationType.FriendRequestAccepted,
            Payload = dto,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public static NotificationDto FriendRequestDeclined(FriendshipRequestEventDto dto)
    {
        return new NotificationDto
        {
            Id = Guid.NewGuid(),
            Type = NotificationType.FriendRequestDeclined,
            Payload = dto,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
 