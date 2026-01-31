namespace Transcendence.Application.Friends.DTOs;

public sealed class FriendDto
{
	public Guid Id { get; init; }
	public string Username { get; init; } = default!;
	public string FullName { get; init; } = default!;
	public string? AvatarUrl { get; init; }

}
