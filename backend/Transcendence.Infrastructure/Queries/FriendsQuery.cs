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

    public async Task<IReadOnlyList<FriendDto>> ListFriendsAsync(Guid userId, CancellationToken ct)
    {
        // Friendships are stored normalized: (User1Id < User2Id).
        // For a given user, friend is the "other" side.
        var friendIds = await _db.Friendships
            .Where(f => f.User1Id == userId || f.User2Id == userId)
            .Select(f => f.User1Id == userId ? f.User2Id : f.User1Id)
            .ToListAsync(ct);

        var users = await _db.Users
            .Where(u => friendIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                u.AvatarFileId
            })
            .ToListAsync(ct);

        var friends = users
            .Select(u => new FriendDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                AvatarUrl = u.AvatarFileId.HasValue ? $"/files/avatar/{u.AvatarFileId.Value}" : null
            })
            .ToList();

        return friends;
    }

    public async Task<IReadOnlyList<FriendshipRequestDto>> ListFriendshipRequestsAsync(Guid userId, CancellationToken ct)
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
            .ToListAsync(ct);

        return requests;
    }
}
