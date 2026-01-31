using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Services;
using Microsoft.AspNetCore.Authorization;
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
    public async Task<ActionResult<ApiResponse<MyProfileDto>>> GetMyProfile()
    {
        Guid userId = GetUserId(); //todo auth

        var profile = await _profileService.GetMyProfileAsync(userId);
        return this.OkResponse(profile);
    }


	// PATCH /profile/me
	[HttpPatch("me")]
    public async Task<ActionResult<ApiResponse<MyProfileDto>>> UpdateProfile( // interface type while method can return different HTTP statuses but has no main type (ex:dto)
        [FromBody] UpdateProfileDto dto) // parse from request to dto
    {
        Guid userId = GetUserId(); //todo auth

        var updatedProfile = await _profileService.UpdateProfileAsync(userId, dto);

        return this.OkResponse(updatedProfile);
    }

	//GET /profile/{userId}
	[HttpGet("{userId:guid}")]
    public async Task<ActionResult<ApiResponse<OtherProfileDto>>> GetOtherProfile(Guid userId)
    {
        Guid viewerId = GetUserId(); //todo auth

        var otherProfile = await _profileService.GetOtherProfileAsync(userId, viewerId);
        return this.OkResponse(otherProfile);

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
/*

    ! Сервисы и репозитории НЕ хранят состояние.
    ! Всё состояние — либо в Domain, либо в БД.

    Короткий итог (зафиксируй)

    ✔ Да, сервис создаётся на каждый запрос
    ✔ Да, репозитории тоже
    ✔ Да, DbContext тоже
    ✔ Это осознанный дизайн
    ✔ Это безопасно
    ✔ Это масштабируемо 
*/