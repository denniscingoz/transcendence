using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Queries;
using Transcendence.Infrastructure.Persistence;

namespace Transcendence.Infrastructure.Queries;

public sealed class FriendsQuery : IFriendsQuery
{
    private readonly TranscendenceDbContext _db;

    public FriendsQuery(TranscendenceDbContext db)
        => _db = db;

    public async Task<IReadOnlyList<FriendDto>> ListFriendsAsync(Guid userId)
    {
        // Friendships are stored normalized: (User1Id < User2Id).
        // For a given user, friend is the "other" side.
        var friendIds = await _db.Friendships
            .Where(f => f.User1Id == userId || f.User2Id == userId)
            .Select(f => f.User1Id == userId ? f.User2Id : f.User1Id)
            .ToListAsync();

        // Adjust mapping depending on what FriendDto contains.
        var friends = await _db.Users
            .Where(u => friendIds.Contains(u.Id))
            .Select(u => new FriendDto
            {
                Id = u.Id,
                Username = u.Username,     // adapt field names
                FullName = u.FullName,     // adapt field names
                AvatarUrl = u.AvatarUrl    // adapt field names
            })
            .ToListAsync();

        return friends;
    }

    public async Task<IReadOnlyList<FriendshipRequestDto>> ListFriendshipRequestsAsync(Guid userId)
    {
        // Requests *to* me: I’m TargetUserId and somebody else requested me.
        var requests = await _db.FriendshipRequests
            .Where(r => r.TargetUserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new FriendshipRequestDto
            {
                Id = r.Id,
                RequesterId = r.RequesterId,
                TargetUserId = r.TargetUserId,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return requests;
    }
}
