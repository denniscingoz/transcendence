using Microsoft.EntityFrameworkCore;
using System.Data;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Domain.Posts;
using Transcendence.Infrastructure.Persistence;
namespace Transcendence.Infrastructure.Repositories;


public sealed class PostsRepository : IPostsRepository
{
	private readonly Transcendence.Infrastructure.Persistence.TranscendenceDbContext _db;

	public PostsRepository( Transcendence.Infrastructure.Persistence.TranscendenceDbContext db)
	{
		_db = db;
	}
	
	public async Task<int> CountByUserIdAsync(Guid userId, CancellationToken ct)
	{
		return await _db.Posts.CountAsync(x => x.AuthorId == userId);
	}



	//GET /posts/{postId}
	public async Task<Post> GetPostAsync(Guid postId, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
	//POST /posts
	public async Task AddPostAsync(Post post, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
	//DELETE /posts/{postId}
	public async void Remove(Post post)
	{
		throw new NotImplementedException("Should be implemented");
	}

	//POST /posts/{postId}/like
	public async Task AddLikeAsync(Guid postId, Guid userId, CancellationToken ct) // you have to check if like already exists before calling this, otherwise it will throw (due to PK constraint)
	{
		throw new NotImplementedException("Should be implemented");
	}
	//DELETE /posts/{postId}/like
	public async Task RemoveLikeAsync(Like like, CancellationToken ct) // you have to check if like exists before calling this, otherwise it will throw (due to PK constraint)
	{
		throw new NotImplementedException("Should be implemented");
	}

	// POST /posts/{postId}/comment
	public async Task AddCommentAsync(Comment comment, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
	// DELETE /posts/{postId}/comment/{commentId}
	public async Task RemoveCommentAsync(Comment comment, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
	
	public async Task<Comment> GetCommentAsync(Guid postId, Guid commentId, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}

	public async Task<Like> GetLikeAsync(Guid postId, Guid currentUserId, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task<int> GetLikeCountAsync(Guid postId, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task<IReadOnlyList<CommentPreviewDto>> GetCommentsAsync(Guid postId, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}

	//SaveChangesAsync
	public async Task SaveChangesAsync(CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task<Guid?> GetAuthorIdByImageFileIdAsync(Guid fileId, CancellationToken ct)
	{
		throw new NotImplementedException("Should be implemented");
	}
}