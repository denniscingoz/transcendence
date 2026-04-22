namespace Transcendence.Application.Chat.DTOs;

public enum FriendshipRequestStatus
{
    Pending = 1,
    Accepted = 2,
    Declined = 3
}

public sealed class FriendshipRequestEventDto
{
    public Guid RequestId { get; init; }
    public Guid RequesterId { get; init; }
    public Guid TargetUserId { get; init; }
    public FriendshipRequestStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
    public string RequesterUsername { get; init; } = default!;
    public string? RequesterAvatarUrl { get; init; }
}