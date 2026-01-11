using Transcendence.Domain.Users;
namespace Transcendence.Application.Users.Interfaces;
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByUsernameAsync(string username);
    Task AddAsync(User user);
    Task SaveChangesAsync();
}