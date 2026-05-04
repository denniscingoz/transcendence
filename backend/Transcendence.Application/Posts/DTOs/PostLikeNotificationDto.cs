namespace Transcendence.Application.Posts.DTOs;

public sealed class PostLikeNotificationDto
{
    public Guid PostId { get; init; }
    public Guid ActorUserId { get; init; }
    public string ActorUsername { get; init; } = default!;
    public string? ActorAvatarUrl { get; init; }
}