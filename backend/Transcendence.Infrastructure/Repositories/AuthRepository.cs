using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Auth.Interfaces;
using Transcendence.Domain.Users;
using Transcendence.Infrastructure.Persistence;

namespace Transcendence.Infrastructure.Repositories;
public class AuthRepository : IAuthRepository
{
	private readonly TranscendenceDbContext _db;

	public AuthRepository(TranscendenceDbContext db)
	{
		_db = db;
	}


	//var user = await _authRepository.GetByGoogleIdAsync(googlePayload.Subject, ct);
	public async Task<User?> GetByGoogleIdAsync(string subject
		, CancellationToken ct) 
	{
		return await _db.Users
		.FirstOrDefaultAsync(u => u.GoogleId == subject, ct);

	}

	//user = await _authRepository.CreateUserWithGoogleDetailsAsync(
	//Guid.NewGuid(),
	//googlePayload.Subject,
	//username,
	//googlePayload.Email,
	//googlePayload.Name,
	//DateTime.UtcNow,
	//ct);
	public async Task<User> CreateUserWithGoogleDetailsAsync(
		Guid userId,
		string subject,
		string username,
		string email,
		string name,
		DateTime createdAt,
		CancellationToken ct)
	{

		var user = new User(userId, subject, username, email, name, createdAt);
		await _db.Users.AddAsync(user, ct);
		await _db.SaveChangesAsync(ct);
		return user;

	}

	public Task SaveChangesAsync(CancellationToken ct)
	{
		 return _db.SaveChangesAsync(ct);
	}
}

