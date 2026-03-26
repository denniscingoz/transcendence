using Microsoft.EntityFrameworkCore;
//using System.Data;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Domain.Posts;
using Transcendence.Infrastructure.Persistence;
namespace Transcendence.Infrastructure.Repositories;


public sealed class PostsRepository : IPostsRepository
{
	private readonly TranscendenceDbContext _db;

	public PostsRepository(TranscendenceDbContext db)
	{
		_db = db;
	}
	
	public Task<int> CountByUserIdAsync(Guid userId, CancellationToken ct)
	{
		return _db.Posts.CountAsync(x => x.AuthorId == userId, ct);
	}

	//GET /posts/{postId}
	public Task<Post?> GetPostAsync(Guid postId, CancellationToken ct)
	{
		return _db.Posts.SingleOrDefaultAsync(x => x.Id == postId, ct);
	}
	//POST /posts
	public async Task AddPostAsync(Post post, CancellationToken ct)
	{
		await _db.Posts.AddAsync(post, ct);
	}
	//DELETE /posts/{postId}
	public void Remove(Post post)
	{
		_db.Posts.Remove(post);
	}

	//POST /posts/{postId}/like
	public async Task AddLikeAsync(Guid postId, Guid userId, CancellationToken ct) // you have to check if like already exists before calling this, otherwise it will throw (due to PK constraint)
	{
		var like = new Like(Guid.NewGuid(), postId, userId);
		await _db.Likes.AddAsync(like, ct);
	}
	//DELETE /posts/{postId}/like
	public Task RemoveLikeAsync(Like like, CancellationToken ct) // you have to check if like exists before calling this, otherwise it will throw (due to PK constraint)
	{
		_db.Likes.Remove(like);
		return Task.CompletedTask;
	}

	// POST /posts/{postId}/comment
	public async Task AddCommentAsync(Comment comment, CancellationToken ct)
	{
		await _db.Comments.AddAsync(comment, ct);
	}
	// DELETE /posts/{postId}/comment/{commentId}
	public Task RemoveCommentAsync(Comment comment, CancellationToken ct)
	{
		_db.Comments.Remove(comment);
		return Task.CompletedTask;
	}
	
	public Task<Comment?> GetCommentAsync(Guid postId, Guid commentId, CancellationToken ct)
	{
		return _db.Comments.SingleOrDefaultAsync(
			x => x.Id == commentId && x.PostId == postId,
			ct);
	}

	public Task<Like?> GetLikeAsync(Guid postId, Guid currentUserId, CancellationToken ct)
	{
		return _db.Likes.SingleOrDefaultAsync(
			x => x.PostId == postId && x.AuthorId == currentUserId,
			ct);
	}
	public Task<int> GetLikeCountAsync(Guid postId, CancellationToken ct)
	{
		return _db.Likes.CountAsync(x => x.PostId == postId, ct);
	}
	public async Task<IReadOnlyList<CommentPreviewDto>> GetCommentsAsync(Guid postId, CancellationToken ct)
	{
		var items = await (
			from c in _db.Comments
			join u in _db.Users on c.AuthorId equals u.Id
			where c.PostId == postId
			orderby c.CreatedAtUtc //ascending
			select new CommentPreviewDto
			{
				Id = c.Id,
				PostId = c.PostId,
				AuthorId = c.AuthorId,
				CreatedAtUtc = c.CreatedAtUtc,
				Content = c.Content,
				Username = u.Username,
				FullName = u.FullName,
				AuthorProfileImageUrl = u.AvatarFileId != null
					? "/files/" + u.AvatarFileId
					: ""
			}
			).ToListAsync(ct);

		return items;
	}

	//SaveChangesAsync
	public Task SaveChangesAsync(CancellationToken ct)
	{
		return _db.SaveChangesAsync(ct);
	}
	public async Task<Guid?> GetAuthorIdByImageFileIdAsync(Guid fileId, CancellationToken ct)
	{
		return await _db.Posts
			.Where(x => x.ImageFileId == fileId)
			.Select(x => (Guid?)x.AuthorId)
			.SingleOrDefaultAsync(ct);
	}
}