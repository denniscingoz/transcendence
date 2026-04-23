using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Infrastructure.Persistence;

namespace Transcendence.Infrastructure.Repositories;
public sealed class PostsProfileRepository : IPostsProfileRepository
{
	private readonly TranscendenceDbContext _db;

	public PostsProfileRepository(TranscendenceDbContext db)
	{
		_db = db;
	}
	public async Task<CursorPageDto<ProfilePostPreviewDto>> GetProfilePostsPreviewAsync(
		Guid targetUserId,
		int take,
		string? cursor,
		CancellationToken ct)
	{
		var query = _db.Posts
			.Where(p => p.AuthorId == targetUserId)
			.OrderByDescending(p => p.CreatedAtUtc)
			.ThenByDescending(p => p.Id)
			.Select(p => new ProfilePostPreviewDto
			{
				Id = p.Id,
				AuthorId = p.AuthorId,
				CreatedAtUtc = p.CreatedAtUtc,
				ImageUrl = "/files/" + p.ImageFileId,
				ImageFileId = p.ImageFileId
			});

		query = ApplyProfilePostCursor(query, cursor);

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

		return new CursorPageDto<ProfilePostPreviewDto>(items, nextCursor);
	} // repository returns: Posts + NextCursor (cursor logic stays in repository)
	public async Task<CursorPageDto<CommentPreviewDto>> GetCommentsAsync(
		Guid postId,
		int take,
		string? cursor,
		CancellationToken ct)
	{
		var query =
			from c in _db.Comments
			join u in _db.Users on c.AuthorId equals u.Id
			where c.PostId == postId
			orderby c.CreatedAtUtc descending, c.Id descending
			select new CommentPreviewDto
			{
				Id = c.Id,
				PostId = c.PostId,
				AuthorId = c.AuthorId,
				CreatedAtUtc = c.CreatedAtUtc,
				Content = c.Content,
				Username = u.Username,
				FullName = u.FullName,
				AuthorProfileImageUrl = u.AvatarFileId != null ? "/files/avatar/" + u.AvatarFileId : ""
			};

		query = ApplyCommentCursor(query, cursor);

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

		return new CursorPageDto<CommentPreviewDto>(items, nextCursor);
	} // repository returns: Comments + NextCursor (cursor logic stays in repository)
	public async Task<CursorPageDto<LikesPreviewDto>> GetLikesAsync(
		Guid postId,
		int take,
		string? cursor,
		CancellationToken ct)
	{
		var query =
			from l in _db.Likes
			join u in _db.Users on l.AuthorId equals u.Id
			where l.PostId == postId
			orderby l.CreatedAtUtc descending, l.Id descending
			select new LikesPreviewDto
			{
				Id = l.Id,
				PostId = l.PostId,
				AuthorId = l.AuthorId,
				CreatedAtUtc = l.CreatedAtUtc,
				AuthorUsername = u.Username,
				AuthorProfileImageUrl = u.AvatarFileId != null ? "/files/avatar/" + u.AvatarFileId : ""
			};

		query = ApplyLikeCursor(query, cursor);

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

		return new CursorPageDto<LikesPreviewDto>(items, nextCursor);
	} // repository returns: Likes + NextCursor (cursor logic stays in repository)

	private static IQueryable<ProfilePostPreviewDto> ApplyProfilePostCursor(
		IQueryable<ProfilePostPreviewDto> query,
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

	private static IQueryable<CommentPreviewDto> ApplyCommentCursor(
		IQueryable<CommentPreviewDto> query,
		string? cursor)
	{
		if (string.IsNullOrWhiteSpace(cursor))
			return query;

		var (ticks, id) = ParseCursor(cursor);
		var createdAtUtc = new DateTime(ticks, DateTimeKind.Utc);

		return query.Where(c =>
			c.CreatedAtUtc < createdAtUtc ||
			(c.CreatedAtUtc == createdAtUtc && c.Id.CompareTo(id) < 0));
	}

	private static IQueryable<LikesPreviewDto> ApplyLikeCursor(
		IQueryable<LikesPreviewDto> query,
		string? cursor)
	{
		if (string.IsNullOrWhiteSpace(cursor))
			return query;

		var (ticks, id) = ParseCursor(cursor);
		var createdAtUtc = new DateTime(ticks, DateTimeKind.Utc);

		return query.Where(l =>
			l.CreatedAtUtc < createdAtUtc ||
			(l.CreatedAtUtc == createdAtUtc && l.Id.CompareTo(id) < 0));
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
