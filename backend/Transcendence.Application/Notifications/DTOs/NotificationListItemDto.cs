namespace Transcendence.Application.Notifications.DTOs;

public sealed class NotificationListItemDto
{
    public Guid Id { get; init; }
    public int Type { get; init; }
    public string Text { get; init; } = default!;
    public string? AvatarUrl { get; init; }
    public bool IsRead { get; init; }
    public DateTime CreatedAt { get; init; }

    public Guid? ActorUserId { get; init; }
    public Guid? RelatedConversationId { get; init; }
    public Guid? RelatedRequestId { get; init; }
}