using System.ComponentModel.DataAnnotations;

namespace Transcendence.Application.Auth.DTOs;

public sealed class SignUpRequestDto
{
	[Required]
	[EmailAddress]
	public string Email { get; set; } = string.Empty;

	[Required]
	[MinLength(8)]
	public string Password { get; set; } = string.Empty;

	[Required]
	public string FullName { get; set; } = string.Empty;

	[Required]
	public string Username { get; set; } = string.Empty;
}