using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Auth.Services;
using Transcendence.Application.Auth.DTOs;


namespace Transcendence.Application.Auth.Interfaces;
public interface IAuthService
{
	Task<AuthResponseDto> SignUpAsync(SignUpRequestDto request, CancellationToken ct);
	Task<AuthResponseDto> SignInAsync(SignInRequestDto request, CancellationToken ct);
	Task SignOutAsync(CancellationToken ct);
	Task<AuthResponseDto> SignInWithGoogleAsync(GoogleSignInRequestDto request, CancellationToken ct);
}
