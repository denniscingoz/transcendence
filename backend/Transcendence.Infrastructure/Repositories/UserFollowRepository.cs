using Transcendence.Domain.UserFollows;
using Microsoft.EntityFrameworkCore;
using Transcendence.Infrastructure.Persistence;
using Transcendence.Application.Friends.Interfaces;
namespace Transcendence.Infrastructure.Repositories;

public sealed class UserFollowRepository : IFriendshipRepository
{
    private readonly TranscendenceDbContext _db;

    public UserFollowRepository(TranscendenceDbContext db)
    {
        _db = db;
    }
    public Task <bool> IsFriendAsync(Guid followerId, Guid followingId) // database level logic, not service
    {
        return _db.UserFollows.AnyAsync(x => x.User2Id == followingId &&
        x.User1Id == followerId );
        
    }
    public async    Task AddFriendAsync(Friendship follow)
    {
       await  _db.UserFollows.AddAsync(follow);
    }

    public  Task RemoveFriendAsync(Guid followerId, Guid followingId)
    {
        var follow = new Friendship(followerId, followingId);
        _db.UserFollows.Remove(follow);
        return Task.CompletedTask; // используется когда метод async по контракту, но внутри синхронный
    }
 
    public async Task <int> CountFriendsAsync (Guid userId)
    {
        return await _db.UserFollows.CountAsync(x => x.User2Id == userId);
    }


}