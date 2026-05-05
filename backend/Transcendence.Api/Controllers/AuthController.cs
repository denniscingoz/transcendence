using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Auth.DTOs;
using Transcendence.Application.Auth.Interfaces;



namespace Transcendence.Api.Controllers;


[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
	private readonly IAuthService _authService;
	public AuthController(IAuthService authService)
	{
		_authService = authService;
	}

	[HttpPost("signup")]
	public async Task<ActionResult<AuthResponseDto>> SignUp([FromBody] SignUpRequestDto request, CancellationToken ct)
	{
		var result = await _authService.SignUpAsync(request, ct);
		return Ok(result);
	}

	[HttpPost("signin")]
	public async Task<ActionResult<AuthResponseDto>> SignIn([FromBody] SignInRequestDto request, CancellationToken ct)
	{
		var result = await _authService.SignInAsync(request, ct);
		return Ok(result);
	}


	[HttpPost("signout")]
	public async Task<IActionResult> SignOut(CancellationToken ct)
	{
		await _authService.SignOutAsync(ct);
		return NoContent();
	}

	[HttpPost("google")]
	public async Task<ActionResult<AuthResponseDto>> SignInWithGoogle([FromBody] GoogleSignInRequestDto request, CancellationToken ct)
	{
		var result = await _authService.SignInWithGoogleAsync(request, ct);
		return Ok(result);
	}

}
