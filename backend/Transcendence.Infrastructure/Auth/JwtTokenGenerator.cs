using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Transcendence.Application.Auth.Interfaces;
using Transcendence.Domain.Auth;
using Transcendence.Domain.Users;

namespace Transcendence.Infrastructure.Auth;

public sealed class JwtTokenGenerator : IJwtTokenGenerator
{
	private readonly JwtOptions _jwtOptions;

	public JwtTokenGenerator(IOptions<JwtOptions> jwtOptions)
	{
		_jwtOptions = jwtOptions.Value;
	}

	public string GenerateToken(User user)
	{
		var claims = new List<Claim>
		{
			new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
			new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
			new Claim(JwtRegisteredClaimNames.Email, user.Email),
			new Claim(ClaimTypes.Name, user.Username)
		};

		if (!string.IsNullOrWhiteSpace(user.Role))
		{
			claims.Add(new Claim(ClaimTypes.Role, user.Role));
		}

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));

		var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken(
			issuer: _jwtOptions.Issuer,
			audience: _jwtOptions.Audience,
			claims: claims,
			expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
			signingCredentials: credentials
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}
