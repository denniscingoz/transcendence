using Microsoft.EntityFrameworkCore;
using  Transcendence.Domain.Posts;
using Transcendence.Application.Posts.Interfaces;
using System.Data;
using Transcendence.Infrastructure.Persistence;
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
        return await _db.Posts.CountAsync(x => x.AuthorId == userId);
    }
    
}