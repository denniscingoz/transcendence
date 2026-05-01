using System.Text;
using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Common.DTOs;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Queries;
using Transcendence.Infrastructure.Persistence;

namespace Transcendence.Infrastructure.Queries;

public sealed class FriendsQuery : IFriendsQuery
{
    private readonly TranscendenceDbContext _db;

    public FriendsQuery(TranscendenceDbContext db)
        => _db = db;

    public async Task<CursorPageDto<FriendDto>> ListFriendsAsync(
        Guid userId, int take, string? cursor, CancellationToken ct)
    {
        // Decode cursor: base64 of "username|guid".
        // Invalid cursor → start from the beginning (don't 400 the client).
        string? cursorUsername = null;
        Guid?   cursorUserId   = null;
        if (!string.IsNullOrWhiteSpace(cursor))
        {
            try
            {
                var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
                var parts   = decoded.Split('|', 2);
                if (parts.Length == 2 && Guid.TryParse(parts[1], out var parsedId))
                {
                    cursorUsername = parts[0];
                    cursorUserId   = parsedId;
                }
            }
            catch { /* fall through, paginate from start */ }
        }

        // Friend ids for this user (normalized table: User1Id < User2Id).
        var friendIds =
            from f in _db.Friendships
            where f.User1Id == userId || f.User2Id == userId
            select f.User1Id == userId ? f.User2Id : f.User1Id;
        var query = _db.Users
            .Where(u => friendIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                u.AvatarFileId
            });        // Keyset filter: rows strictly after the cursor in (Username, Id) order.
        if (cursorUsername is not null && cursorUserId is not null)
        {
            var cu  = cursorUsername;
            var cid = cursorUserId.Value;
            query = query.Where(u =>
                string.Compare(u.Username, cu) > 0
                || (u.Username == cu && u.Id.CompareTo(cid) > 0));
        }

        var rows = await query
            .OrderBy(u => u.Username)
            .ThenBy(u => u.Id)
            .Take(take + 1)            // +1 sentinel to detect "has more"
            .ToListAsync(ct);

        string? nextCursor = null;
        if (rows.Count > take)
        {
            var last = rows[take - 1];
            var raw  = $"{last.Username}|{last.Id}";
            nextCursor = Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
            rows = rows.Take(take).ToList();
        }

        var items = rows
            .Select(u => new FriendDto
            {
                Id        = u.Id,
                Username  = u.Username,
                FullName  = u.FullName,
                AvatarUrl = u.AvatarFileId.HasValue
                    ? $"/files/avatar/{u.AvatarFileId.Value}"
                    : null
            })
            .ToList();

        return new CursorPageDto<FriendDto> { Items = items, NextCursor = nextCursor };
    }

    public async Task<IReadOnlyList<FriendshipRequestDto>> ListFriendshipRequestsAsync(
        Guid userId, CancellationToken ct)
    {
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
