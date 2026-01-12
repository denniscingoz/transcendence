using Transcendence.Domain.UserFollows;
using Transcendence.Application.UserFollows.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography.X509Certificates;

public sealed class UserFollowRepository : IUserFollowRepository
{
    private readonly TranscendenceDbContext _db;

    public UserFollowRepository(TranscendenceDbContext db)
    {
        _db = db;
    }
    public Task <bool> IsFollowingAsync(Guid followerId, Guid followingId) // database level logic, not service
    {
        return _db.UserFollows.AnyAsync(x => x.FollowingId == followingId &&
        x.FollowerId == followerId );
        
    }
    public    async Task AddAsync(UserFollow follow)
    {
       await  _db.UserFollows.AddAsync(follow);
    }

    public Task RemoveAsync(Guid followerId, Guid followingId)
    {
        var follow = new UserFollow(followerId, followingId);
        _db.UserFollows.Remove(follow);
        return Task.CompletedTask; // используется когда метод async по контракту, но внутри синхронный
    }


}