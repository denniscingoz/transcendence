namespace Transcendence.Application.Friends.DTOs;
public sealed class FriendshipRequestDto
{
	public Guid Id { get; init; }
	public Guid RequesterId { get; init; }
	public Guid TargetUserId { get; init; }
	public DateTime CreatedAt { get; init; }
}
