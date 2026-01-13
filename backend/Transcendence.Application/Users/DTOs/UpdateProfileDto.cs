namespace Transcendence.Application.Users.DTOs;

public sealed class UpdateProfileDto
{
    public string? FullName { get; init; }
    public string? Bio { get; init; }
    public string? Username { get; init; }
}