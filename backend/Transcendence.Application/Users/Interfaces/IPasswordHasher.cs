using Transcendence.Application.Users.DTOs;

namespace Transcendence.Application.Users.Interfaces;

public interface IPasswordHasher
{
	string HashPassword(string password);
	bool VerifyHashedPassword(string hashedPassword, string providedPassword);
}