namespace Transcendence.Application.Auth.DTOs;
public sealed class AuthUserDto
{
	public Guid Id { get; set; }
	public string Username { get; set; } = string.Empty;
}

public sealed class AuthResponseDto
{
	public string Token { get; set; } = string.Empty;
	public AuthUserDto User { get; set; } = new();
}