using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Transcendence.Application.Common.Responses;
using Transcendence.Api.Common.Extensions;

namespace Transcendence.Api.Controllers;

[ApiController]
[Route("profile")]
[Authorize]
public sealed class ProfileController : ControllerBase
{
    private readonly ProfileService _profileService;

    public ProfileController(ProfileService profileService)
    {
        _profileService = profileService;

    }
    //GET /profile/me
    [HttpGet ("me")]
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
    
    private Guid GetUserId() //tepmorary
    {
        // TODO: заменить на Claims позже
        return Guid.Parse(User.FindFirst("sub")!.Value);
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