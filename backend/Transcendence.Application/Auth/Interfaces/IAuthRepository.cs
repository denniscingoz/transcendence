using Transcendence.Domain.Users;

namespace Transcendence.Application.Auth.Interfaces;
public interface IAuthRepository
{

//	var user = await _authRepository.GetByGoogleIdAsync(googlePayload.Subject, ct);
	Task<User?> GetByGoogleIdAsync(string Subject, CancellationToken ct);

	//user = await _authRepository.CreateUserWithGoogleDetailsAsync(
			//Guid.NewGuid(),
			//googlePayload.Subject,
			//username,
			//googlePayload.Email,
			//googlePayload.Name,
			//DateTime.UtcNow,
			//ct);
	Task<User> CreateUserWithGoogleDetailsAsync(Guid userId, string Subject, string username, string email, string name, DateTime createdAt, CancellationToken ct);
	Task SaveChangesAsync(CancellationToken ct);


}
