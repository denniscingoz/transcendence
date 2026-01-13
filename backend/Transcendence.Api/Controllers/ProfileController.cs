using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Services;

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
    public async Task<ActionResult<MyProfileDto>> GetMyProfile()
    {
        Guid userId = GetUserId();

        var profile = await _profileService.GetMyProfileAsync(userId);
        return Ok(profile);
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