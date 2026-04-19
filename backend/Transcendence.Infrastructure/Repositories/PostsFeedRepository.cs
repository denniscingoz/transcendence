using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Infrastructure.Persistence;

namespace Transcendence.Infrastructure.Repositories;
public sealed class PostsFeedRepository : IPostsFeedRepository
{
	private readonly TranscendenceDbContext _db;
	
	public PostsFeedRepository(TranscendenceDbContext db)
	{
		_db = db;
	}
	public async Task<CursorPageDto<FeedPostRowDto>> GetFeedPageAsync(
		Guid currentUserId,
		int take,
		string? cursor,
		CancellationToken ct)
	{
		var friendIds = await _db.Friendships
			.Where(f => f.User1Id == currentUserId || f.User2Id == currentUserId)
			.Select(f => f.User1Id == currentUserId ? f.User2Id : f.User1Id)
			.ToListAsync(ct);

		if (friendIds.Count == 0)
			return new CursorPageDto<FeedPostRowDto>(new List<FeedPostRowDto>(), null);
		//var visibleAuthorIds = friendIds.Append(currentUserId);
		
		var query =
			from p in _db.Posts
			join u in _db.Users on p.AuthorId equals u.Id
			where friendIds.Contains(p.AuthorId)
			orderby p.CreatedAtUtc descending, p.Id descending
			select new FeedPostRowDto
			{
				Id = p.Id,
				AuthorId = p.AuthorId,
				CreatedAtUtc = p.CreatedAtUtc,
				Content = p.Content,
				ImageFileId = p.ImageFileId,
				IsLikedByCurrentUser = _db.Likes.Any(l => l.PostId == p.Id && l.AuthorId == currentUserId),
				LikesCount = _db.Likes.Count(l => l.PostId == p.Id),
				AuthorFullName = u.FullName,
				AuthorUsername = u.Username,
				AuthorAvatarUrl = u.AvatarFileId != null ? "/files/avatar/" + u.AvatarFileId : null
			};

		query = ApplyCursor(query, cursor);

		var items = await query
			.Take(take + 1)
			.ToListAsync(ct);

		string? nextCursor = null;

		if (items.Count > take)
		{
			var extra = items[^1];
			items.RemoveAt(items.Count - 1);
			nextCursor = $"{extra.CreatedAtUtc.Ticks}_{extra.Id}";
		}

		return new CursorPageDto<FeedPostRowDto>(items, nextCursor);
	}

	private static IQueryable<FeedPostRowDto> ApplyCursor(
		IQueryable<FeedPostRowDto> query,
		string? cursor)
	{
		if (string.IsNullOrWhiteSpace(cursor))
			return query;

		var (ticks, id) = ParseCursor(cursor);
		var createdAtUtc = new DateTime(ticks, DateTimeKind.Utc);

		return query.Where(p =>
			p.CreatedAtUtc < createdAtUtc ||
			(p.CreatedAtUtc == createdAtUtc && p.Id.CompareTo(id) < 0));
	}

	private static (long ticks, Guid id) ParseCursor(string cursor)
	{
		var parts = cursor.Split('_', 2);
		if (parts.Length != 2)
			throw new ArgumentException("Invalid cursor format.", nameof(cursor));

		if (!long.TryParse(parts[0], out var ticks))
			throw new ArgumentException("Invalid cursor ticks.", nameof(cursor));

		if (!Guid.TryParse(parts[1], out var id))
			throw new ArgumentException("Invalid cursor id.", nameof(cursor));

		return (ticks, id);
	}
}
