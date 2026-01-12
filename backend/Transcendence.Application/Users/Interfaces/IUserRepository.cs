using Transcendence.Domain.Users;
namespace Transcendence.Application.Users.Interfaces;
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByUsernameAsync(string username);
    Task AddAsync(User user);
    Task SaveChangesAsync();
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