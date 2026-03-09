using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Services;
using Transcendence.Application.Common.Responses;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Users.Interfaces;

namespace Transcendence.Api.Controllers;

[Authorize]
[ApiController]
[Route("profile")]
public sealed class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    public ProfileController(IProfileService profileService) {_profileService = profileService;}

	//GET /profile/me
	[HttpGet("me")]
    public async Task<ActionResult<ApiResponse<MyProfileDto>>> GetMyProfile(CancellationToken ct)
    {
        Guid userId = GetUserId(); //todo auth

        var profile = await _profileService.GetMyProfileAsync(userId, ct);
        return this.OkResponse(profile);
    }

	//GET /profile/{userId}
	[HttpGet("{userId:guid}")]
	public async Task<ActionResult<ApiResponse<OtherProfileDto>>> GetOtherProfile(Guid userId, CancellationToken ct)
	{
		Guid viewerId = GetUserId(); //todo auth

		var otherProfile = await _profileService.GetOtherProfileAsync(userId, viewerId, ct);
		return this.OkResponse(otherProfile);

	}

	// PATCH /profile/me
	[HttpPatch("me")]
    public async Task<ActionResult<ApiResponse<MyProfileDto>>> UpdateProfile( // interface type while method can return different HTTP statuses but has no main type (ex:dto)
        [FromBody] UpdateProfileDto dto, CancellationToken ct) // parse from request to dto
    {
        Guid userId = GetUserId(); //todo auth

        var updatedProfile = await _profileService.UpdateProfileAsync(userId, dto, ct);

        return this.OkResponse(updatedProfile);
    }

	// PATCH /profile/password
    [HttpPatch("password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto dto, CancellationToken ct)
    {
        Guid userId = GetUserId(); //todo auth
        await _profileService.ChangePasswordAsync(userId, dto, ct);
        return NoContent(); // 204 No Content
	}

	private Guid GetUserId()
	{
		var value =
			User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
			?? User.FindFirst("sub")?.Value;

		if (value is null || !Guid.TryParse(value, out var userId))
			throw new UnauthorizedAccessException("Invalid token.");

		return userId;
	}
}
