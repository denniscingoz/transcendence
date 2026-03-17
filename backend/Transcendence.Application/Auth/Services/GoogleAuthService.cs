using Microsoft.Extensions.Options;
using Transcendence.Application.Auth.DTOs;
using Transcendence.Application.Auth.Interfaces;
using Google.Apis.Auth;


namespace Transcendence.Application.Auth.Services;
public sealed class GoogleAuthService : IGoogleAuthService
{

		private readonly GoogleAuthOptions _googleOptions;

		public GoogleAuthService(IOptions<GoogleAuthOptions> googleOptions)
		{
			_googleOptions = googleOptions.Value;
		}

		
		public async Task<GoogleUserPayloadDto> VerifyIdTokenAsync(string idToken, CancellationToken ct)
		{
			ct.ThrowIfCancellationRequested();
			
			if (string.IsNullOrWhiteSpace(idToken))
				throw new ArgumentException("IdToken is required.", nameof(idToken));

			if (string.IsNullOrWhiteSpace(_googleOptions.ClientId))
				throw new InvalidOperationException("Google ClientId is not configured.");

			GoogleJsonWebSignature.Payload payload;

			try
			{
				var settings = new GoogleJsonWebSignature.ValidationSettings
				{
					Audience = new[] { _googleOptions.ClientId }
				};

				payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
			}
			catch (InvalidJwtException)
			{
				throw new UnauthorizedAccessException("Invalid Google ID token.");
			}
			ct.ThrowIfCancellationRequested();


			if (string.IsNullOrWhiteSpace(payload.Subject))
				throw new UnauthorizedAccessException("Google subject is missing.");

			if (string.IsNullOrWhiteSpace(payload.Email))
				throw new UnauthorizedAccessException("Google email is missing.");

			return new GoogleUserPayloadDto
			{
				Subject = payload.Subject,
				Email = payload.Email,
				Name = payload.Name ?? string.Empty
			};

		}

}

