namespace Transcendence.Application.Users.DTOs;

public sealed class OtherProfileDto
{
    public Guid Id { get; init; }
    public string Username { get; init; } = default!;
    public string FullName { get; init; } = default!;
    public string? Bio { get; init; }
    public string? AvatarUrl { get; init; }
    public int PostsCount { get; init; }
	public int FriendsCount { get; init; }
	public bool AreWeFriends { get; init; }
}

