using System.ComponentModel.DataAnnotations;

namespace Transcendence.Application.Users.DTOs;

public sealed class ChangePasswordDto
{
	[Required]
	[StringLength(50, MinimumLength = 8,
		ErrorMessage = "Password must be between 8 and 50 characters long.")]
	public string CurrentPassword { get; init; } = default!;

	[Required]
	[StringLength(50, MinimumLength = 8,
		ErrorMessage = "Password must be between 8 and 50 characters long.")]
	[RegularExpression(
		@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).+$",
		ErrorMessage = "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
	)]
	public string NewPassword { get; init; } = default!;
}