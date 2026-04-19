using System.ComponentModel.DataAnnotations;

namespace Transcendence.Application.Auth.DTOs;

public sealed class SignUpRequestDto
{
	[Required]
	[EmailAddress]
	[StringLength(255, ErrorMessage = "Email cannot be longer than 255 characters.")]
	public string Email { get; set; } = string.Empty;

	[Required]
	[StringLength(50, MinimumLength = 8,
		ErrorMessage = "Password must be between 8 and 50 characters long.")]
	[RegularExpression(
		@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).+$",
		ErrorMessage = "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
	)]
	public string Password { get; set; } = string.Empty;

	[Required]
	[StringLength(50, ErrorMessage = "Full name cannot be longer than 50 characters.")]
	public string FullName { get; set; } = string.Empty;

	[Required]
	[StringLength(15, MinimumLength = 6,
		ErrorMessage = "Username must be between 6 and 15 characters long.")]
	public string Username { get; set; } = string.Empty;
}