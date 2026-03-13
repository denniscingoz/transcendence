using Transcendence.Domain.Users;

namespace Transcendence.Application.Auth.Interfaces;
public interface IJwtTokenGenerator
{
	string GenerateToken(User user);

}

