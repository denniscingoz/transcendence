namespace Transcendence.Application.Users.DTOs;
public sealed class OtherProfileDto
{
    public Guid Id {get; init; }
    public string Username { get; init; } = default!; //null but temporary. !  garanties that will not be null
    public string?  Bio { get; init; }
    public string?  AvatarUrl { get; init; }
    public bool IsFollowing { get; init; }

}