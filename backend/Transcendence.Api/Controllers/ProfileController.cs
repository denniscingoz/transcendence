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

}