using Transcendence.Domain.Users;
using Transcendence.Application.Users.Interfaces;
using Microsoft.EntityFrameworkCore;
using Transcendence.Infrastructure.Persistence;
namespace Transcendence.Infrastructure.Repositories;

public sealed class UserRepository : IUserRepository
{

    private readonly TranscendenceDbContext _db;

    public UserRepository(TranscendenceDbContext db) 
    {
        _db = db;
    }

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
	{
        return _db.Users.SingleOrDefaultAsync(x => x.Id == id);
    }
    public Task<User?> GetByUsernameAsync(string username, CancellationToken ct)
    {
        return _db.Users.SingleOrDefaultAsync(x=> x.Username == username);
    }
    public async Task<Guid> GetUserIdByAvatarFileIdAsync(Guid fileId, CancellationToken ct)
    {
        throw new NotImplementedException();
    }
	public async Task  AddAsync(User user, CancellationToken ct)
    {
       await _db.Users.AddAsync(user);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync();  // User - Aggregate Root
    }
}

