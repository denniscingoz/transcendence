namespace Transcendence.Domain.Notifications;

public class Notification
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public int Type { get; private set; }

    public Guid? ActorUserId { get; private set; }
    public Guid? RelatedConversationId { get; private set; }
    public Guid? RelatedRequestId { get; private set; }

    public string Text { get; private set; } = default!;
    public string? ActorUsername { get; private set; }
    public string? ActorAvatarUrl { get; private set; }

    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Notification() { }

    public Notification(
        Guid id,
        Guid userId,
        int type,
        string text,
        DateTime createdAt,
        Guid? actorUserId = null,
        string? actorUsername = null,
        string? actorAvatarUrl = null,
        Guid? relatedConversationId = null,
        Guid? relatedRequestId = null)
    {
        Id = id;
        UserId = userId;
        Type = type;
        Text = text;
        CreatedAt = createdAt;
        ActorUserId = actorUserId;
        ActorUsername = actorUsername;
        ActorAvatarUrl = actorAvatarUrl;
        RelatedConversationId = relatedConversationId;
        RelatedRequestId = relatedRequestId;
        IsRead = false;
    }

    public void MarkAsRead()
    {
        IsRead = true;
    }
}