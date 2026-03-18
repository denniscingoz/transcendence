using System.ComponentModel.DataAnnotations;

namespace Transcendence.Application.Users.DTOs;

public sealed class ChangePasswordDto
{
	[Required]
	public string CurrentPassword { get; init; } = default!;

	[Required]
	[StringLength(100, MinimumLength = 8)]
	public string NewPassword { get; init; } = default!;
}