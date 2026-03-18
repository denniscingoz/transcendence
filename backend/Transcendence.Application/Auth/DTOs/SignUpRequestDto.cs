using System.ComponentModel.DataAnnotations;

namespace Transcendence.Application.Auth.DTOs;

public sealed class SignUpRequestDto
{
	[Required]
	[EmailAddress]
	[MaxLength(255)]
	public string Email { get; set; } = string.Empty;

	[Required]
	[StringLength(100, MinimumLength = 8)]
	public string Password { get; set; } = string.Empty;

	[Required]
	[MaxLength(100)]
	public string FullName { get; set; } = string.Empty;

	[Required]
	[MaxLength(50)]
	public string Username { get; set; } = string.Empty;
}