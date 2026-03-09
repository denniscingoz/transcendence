
using Transcendence.Application.Users.Interfaces;

namespace Transcendence.Infrastructure.Auth;

public sealed class PasswordHasher : IPasswordHasher
{

	public string HashPassword(string password)
	{
		throw new NotImplementedException("Should be implemented");
	}
	public bool VerifyHashedPassword(string hashedPassword, string providedPassword)
	{
		throw new NotImplementedException("Should be implemented");
	}
}

