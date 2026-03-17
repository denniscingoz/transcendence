namespace Transcendence.Application.Auth.DTOs;

public sealed class GoogleSignInRequestDto
{
	public string IdToken { get; set; } = string.Empty;
}