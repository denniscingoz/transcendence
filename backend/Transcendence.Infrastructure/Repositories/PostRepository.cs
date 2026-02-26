using Microsoft.EntityFrameworkCore;
using Transcendence.Domain.Posts;
using System.Data;
using Transcendence.Infrastructure.Persistence;
using Transcendence.Application.Users.Interfaces.Posts;
namespace Transcendence.Infrastructure.Repositories;


public sealed class PostRepository : IPostRepository
{
private readonly Transcendence.Infrastructure.Persistence.TranscendenceDbContext _db;

public PostRepository(
    Transcendence.Infrastructure.Persistence.TranscendenceDbContext db)
    {
        _db = db;
    }

    public async Task<int> CountByUserIdAsync(Guid userId)
    {
        return await _db.Posts.CountByUserIdAsync(x => x.AuthorId == userId);
    }
    
}