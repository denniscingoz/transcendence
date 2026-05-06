using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Queries;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Infrastructure.Persistence;

namespace Transcendence.Infrastructure.Queries;

public sealed class FriendsQuery : IFriendsQuery
{
    private readonly TranscendenceDbContext _db;

    public FriendsQuery(TranscendenceDbContext db)
        => _db = db;

	public async Task<CursorPageDto<FriendDto>> ListFriendsAsync(
	Guid userId,
	int take,
	string? cursor,
	CancellationToken ct)
	{
		// Convert the cursor string into a Guid.
		// If cursor is null or empty, this is the first page.
		Guid? cursorId = null;

		if (!string.IsNullOrWhiteSpace(cursor))
		{
			// Cursor must be a valid Guid because we use User.Id as the cursor.
			if (!Guid.TryParse(cursor, out var parsedCursor))
				throw new ArgumentException("Invalid cursor.", nameof(cursor));

			cursorId = parsedCursor;
		}

		// Build the query for all friendships where the current user exists.
		var query =
			from friendship in _db.Friendships.AsNoTracking()
			where friendship.User1Id == userId || friendship.User2Id == userId

			// Friendships are stored as two user ids.
			// The friend is whichever id is NOT the current user's id.
			let friendId = friendship.User1Id == userId
				? friendship.User2Id
				: friendship.User1Id

			// Join the friend id with the Users table to get profile data.
			join user in _db.Users.AsNoTracking()
				on friendId equals user.Id

			// Apply cursor pagination.
			// First page: cursorId is null, so this filter does nothing.
			// Next pages: return only users with an Id after the cursor.
			where cursorId == null || user.Id.CompareTo(cursorId.Value) > 0

			// Cursor pagination needs a stable order.
			// The cursor is based on user.Id, so we order by user.Id.
			orderby user.Id

			// Convert the database user into the DTO returned to the frontend.
			select new FriendDto
			{
				Id = user.Id,
				Username = user.Username,
				FullName = user.FullName,
				AvatarUrl = user.AvatarFileId.HasValue
					? $"/files/avatar/{user.AvatarFileId.Value}"
					: null
			};

		// Fetch one more item than requested.
		// Example: if take = 20, fetch 21.
		// The extra item is only used to check whether another page exists.
		var items = await query
			.Take(take + 1)
			.ToListAsync(ct);

		// If we got more than "take", there is another page.
		var hasExtraItem = items.Count > take;

		// Remove the extra item before returning data to the frontend.
		if (hasExtraItem)
			items = items.Take(take).ToList();

		// If another page exists, the next cursor is the last returned user's id.
		// If there is no next page, return null.
		var nextCursor = hasExtraItem
			? items[^1].Id.ToString()
			: null;

		// Return the page items and the cursor for the next request.
		return new CursorPageDto<FriendDto>(items, nextCursor);
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