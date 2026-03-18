using System.ComponentModel.DataAnnotations;

namespace Transcendence.Application.Users.DTOs;

public sealed class UpdateProfileDto
{
    [StringLength(20, MinimumLength = 5)] //dasha: why these limits?
	public string? FullName { get; init; } // Nullable = optional update

	[StringLength(500, MinimumLength = 0)]
    public string? Bio { get; init; } // Nullable = optional update

	[StringLength(15, MinimumLength = 3)] //dasha: why these limits?
    public string? Username { get; init; } // Nullable = optional update

	public string? AvatarUrl { get; init; } // Nullable = optional update

	public string? Password { get; init; } // Nullable = optional update
	//dasha: we have a separate ChangePasswordDto! do we need this one here?

}


// if AvatarUrl is empty string, it means user wants to remove the avatar
// if AvatarUrl is null, it means user does not want to update the avatar

// if Bio is empty string, it means user wants to remove the bio
// if Bio is null, it means user does not want to update the bio
