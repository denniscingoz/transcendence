using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Transcendence.Application.Auth.DTOs;
using Transcendence.Application.Auth.Interfaces;
using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Domain.Users;

namespace Transcendence.Application.Auth.Services;

public sealed class AuthService : IAuthService
{
	private readonly IUserRepository _userRepository;
	private readonly IPasswordHasher<User> _passwordHasher;
	private readonly IJwtTokenGenerator _jwtTokenGenerator;
	private readonly IGoogleAuthService _googleAuthService;
	private readonly IAuthRepository _authRepository;

	public AuthService(
		IUserRepository userRepository,
		IPasswordHasher<User> passwordHasher,
		IJwtTokenGenerator jwtTokenGenerator,
		IGoogleAuthService googleAuthService)
	{
		_userRepository = userRepository;
		_passwordHasher = passwordHasher;
		_jwtTokenGenerator = jwtTokenGenerator;
		_googleAuthService = googleAuthService;
	}

	public async Task<AuthResponseDto> SignUpAsync(SignUpRequestDto request, CancellationToken ct)
	{

		if (request == null) { throw new ArgumentNullException(nameof(request)); }
		
		if (string.IsNullOrWhiteSpace(request.Email)) { throw new ArgumentException("Email is required.", nameof(request.Email)); }
		if (string.IsNullOrWhiteSpace(request.Password)) { throw new ArgumentException("Password is required.", nameof(request.Password)); }
		if (string.IsNullOrWhiteSpace(request.Username)) { throw new ArgumentException("Username is required.", nameof(request.Username)); }
		if (string.IsNullOrWhiteSpace(request.FullName)) { throw new ArgumentException("FullName is required.", nameof(request.FullName)); }
		
		request.FullName = request.FullName.Trim();
		request.Username = request.Username.Trim();
		request.Email = request.Email.Trim();
		
		var existingByEmail = await _userRepository.GetByEmailAsync(request.Email, ct);
		if (existingByEmail != null)
			throw new ArgumentException("Email is already in use.", nameof(request.Email));

		var existingByUsername = await _userRepository.GetByUsernameAsync(request.Username, ct);
		if (existingByUsername != null)
			throw new ArgumentException("Username is already in use.", nameof(request.Username));

		if(request.FullName.Length > 100) { throw new ArgumentException("FullName must not exceed 100 characters.", nameof(request.FullName)); }
		
		
		if(request.Username.Length > 100) { throw new ArgumentException("Username must not exceed 100 characters.", nameof(request.Username)); }
		if(request.Username.Any(char.IsWhiteSpace))
			throw new ArgumentException("Username must not contain whitespace.", nameof(request.Username));
		if(request.Username.Length < 6)
			throw new ArgumentException("Username must be at least 6 characters long.", nameof(request.Username));

		if (request.Email.Length > 100)
			throw new ArgumentException("Email must not exceed 100 characters.", nameof(request.Email));
		if(!request.Email.Contains('@') || !request.Email.Contains('.'))
			throw new ArgumentException("Email must be a valid email address.", nameof(request.Email));
		if(request.Email.Any(char.IsWhiteSpace))
			throw new ArgumentException("Email must not contain whitespace.", nameof(request.Email));


		if (request.Password.Length < 8) { throw new ArgumentException("Password must be at least 8 characters long.", nameof(request.Password)); }
		if (request.Password.Any(char.IsWhiteSpace))
			throw new ArgumentException("Password must not contain whitespace.", nameof(request.Password));
		if(!request.Password.Any(char.IsUpper))
			throw new ArgumentException("Password must contain at least one uppercase letter.", nameof(request.Password));
		if (!request.Password.Any(char.IsDigit))
			throw new ArgumentException("Password must contain at least one digit.", nameof(request.Password));
		if (!request.Password.Any(ch => !char.IsLetterOrDigit(ch)))
			throw new ArgumentException("Password must contain at least one special character.", nameof(request.Password));
		
		var user = new User(
			Guid.NewGuid(),
			request.Username,
			request.Email,
			request.FullName,
			DateTime.UtcNow,
			"User"
		);
		var passwordHash = _passwordHasher.HashPassword(user, request.Password);
		user.SetPasswordHash(passwordHash);

		await _userRepository.AddAsync(user, ct);
		await _userRepository.SaveChangesAsync(ct);

		var token = _jwtTokenGenerator.GenerateToken(user);
		return new AuthResponseDto { Token = token };

	}
	public async Task<AuthResponseDto> SignInAsync(SignInRequestDto request, CancellationToken ct)
	{

		if (request == null) { throw new ArgumentNullException(nameof(request)); }

		request.Email = request.Email.Trim();
		
		if (string.IsNullOrWhiteSpace(request.Email)) { throw new ArgumentException("Email is required.", nameof(request.Email)); }
		if (string.IsNullOrWhiteSpace(request.Password)) { throw new ArgumentException("Password is required.", nameof(request.Password)); }

		var user = await _userRepository.GetByEmailAsync(request.Email, ct)
			?? throw new UnauthorizedAccessException("Invalid credentials.");

		var verificationResult = _passwordHasher.VerifyHashedPassword(
			user,
			user.PasswordHash,
			request.Password);

		if (verificationResult == PasswordVerificationResult.Failed)
		{
			throw new UnauthorizedAccessException("Invalid credentials.");
		}

		var token = _jwtTokenGenerator.GenerateToken(user);
		return new AuthResponseDto
		{
			Token = token
		};
	}

	public Task SignOutAsync(CancellationToken ct)
	{
		ct.ThrowIfCancellationRequested();
		return Task.CompletedTask;
	}
	public async Task<AuthResponseDto> SignInWithGoogleAsync(
	GoogleSignInRequestDto request,
	CancellationToken ct)
	{
		if (request is null) { throw new ArgumentNullException(nameof(request)); }

		if (string.IsNullOrWhiteSpace(request.IdToken))
			throw new ArgumentException("IdToken is required.", nameof(request.IdToken));

		var googlePayload = await _googleAuthService.VerifyIdTokenAsync(request.IdToken, ct);

		var user = await _authRepository.GetByGoogleIdAsync(googlePayload.Subject, ct);

		if (user is null)
		{
			var emailPrefix = googlePayload.Email.Split('@')[0];
			var suffix = Guid.NewGuid().ToString("N")[..8];
			var username = $"{emailPrefix}_{suffix}";

			if (string.IsNullOrWhiteSpace(googlePayload.Name) || googlePayload.Name.Length > 100)
			{
				googlePayload.Name = "Unidentified Name";
			}

			user = await _authRepository.CreateUserWithGoogleDetailsAsync(
				Guid.NewGuid(),
				googlePayload.Subject,
				username,
				googlePayload.Email,
				googlePayload.Name,
				DateTime.UtcNow,
				ct);
			await _authRepository.SaveChangesAsync(ct);
		}

		var token = _jwtTokenGenerator.GenerateToken(user);
		return new AuthResponseDto { Token = token };
	}


}




