using Transcendence.Domain.Users;
namespace Transcendence.Application.Users.Interfaces;
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct);
	Task<User?> GetByEmailAsync(string email, CancellationToken ct);
	Task<Guid?> GetUserIdByAvatarFileIdAsync(Guid fileId, CancellationToken ct);//dasha: can be null
	Task AddAsync(User user, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
/*
    Repository
	•	знает как читать / писать данные
	•	переводит Domain ↔ БД
	•	НЕ знает:
	•	бизнес-сценарии
	•	HTTP
	•	кто кого вызывает 
*/