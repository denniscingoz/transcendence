using Transcendence.Domain.Users;
using Transcendence.Application.Users.Interfaces;
using Microsoft.EntityFrameworkCore;

public sealed class UserRepository : IUserRepository
{

    private readonly TranscendenceDbContext _db;

    public UserRepository(TranscendenceDbContext db) 
    {
        _db = db;
    }

    public Task<User?> GetByIdAsync(Guid id)
    {
        return _db.Users.SingleOrDefaultAsync(x => x.Id == id);
    }
    public Task<User?> GetByUsernameAsync(string username)
    {
        return _db.Users.SingleOrDefaultAsync(x=> x.Username == username);
    }
    public async Task  AddAsync(User user)
    {
       await _db.Users.AddAsync(user);
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();  // User - Aggregate Root
    }
}

