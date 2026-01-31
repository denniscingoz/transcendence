using System.ComponentModel.DataAnnotations;

namespace Transcendence.Application.Users.DTOs;

public sealed class UpdateProfileDto
{
    [StringLength(20, MinimumLength = 5)]
	public string? FullName { get; init; } // Nullable = optional update

    public string? Bio { get; init; } // Nullable = optional update

	[StringLength(15, MinimumLength = 3)] 
    public string? Username { get; init; } // Nullable = optional update

	public string? AvatarUrl { get; init; } // Nullable = optional update

}


// if AvatarUrl is empty string, it means user wants to remove the avatar
// if AvatarUrl is null, it means user does not want to update the avatar

// if Bio is empty string, it means user wants to remove the bio
// if Bio is null, it means user does not want to update the bio
