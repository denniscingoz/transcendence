using Transcendence.Application.Posts.DTOs;
using Transcendence.Domain.Posts;
namespace Transcendence.Application.Posts.Interfaces;

public interface IPostRepository
{
    Task<int> CountByUserIdAsync(Guid userId, CancellationToken ct);

	//GET /posts/{postId}
	Task<Post> GetPostAsync(Guid postId, CancellationToken ct);

	//POST /posts
	Task AddPostAsync(Post post, CancellationToken ct);

	//DELETE /posts/{postId}
	void Remove(Post post);

	//POST /posts/{postId}/like
	Task AddLikeAsync(Guid postId, Guid userId, CancellationToken ct); // you have to check if like already exists before calling this, otherwise it will throw (due to PK constraint)

	//DELETE /posts/{postId}/like
	Task RemoveLikeAsync(Like like, CancellationToken ct); // you have to check if like exists before calling this, otherwise it will throw (due to PK constraint)


	// POST /posts/{postId}/comment
	Task AddCommentAsync(Comment comment, CancellationToken ct);

	// DELETE /posts/{postId}/comment/{commentId}
	Task RemoveCommentAsync(Comment comment, CancellationToken ct);
	Task<Comment> GetCommentAsync(Guid postId, Guid commentId, CancellationToken ct);


	Task<Like> GetLikeAsync(Guid postId, Guid currentUserId, CancellationToken ct);
	Task<int> GetLikeCountAsync(Guid postId, CancellationToken ct);
	Task<IReadOnlyList<CommentDto>> GetCommentsAsync(Guid postId, CancellationToken ct);


	//SaveChangesAsync
	Task SaveChangesAsync(CancellationToken ct);

	Task<Guid?> GetAuthorIdByImageFileIdAsync(Guid fileId, CancellationToken ct);


}