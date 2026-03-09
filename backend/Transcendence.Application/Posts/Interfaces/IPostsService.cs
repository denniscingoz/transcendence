using Transcendence.Application.Posts.DTOs;
namespace Transcendence.Application.Posts.Interfaces;

public interface IPostsService
{
	Task<PostDto> GetPostAsync(Guid postId, Guid currentUserId, CancellationToken ct); //+ GET /posts/{postId}

	Task<PostDto> CreatePostAsync(Guid currentUserId, CreatePostDto dto, CancellationToken ct); //+ POST /posts

	Task DeletePostAsync(Guid postId, Guid currentUserId, CancellationToken ct); //+ DELETE /posts/{postId}

	
	
	// Idempotent: returns true if state changed, false if already in desired state
	Task LikePostAsync(Guid postId, Guid currentUserId, CancellationToken ct); //+ POST /posts/{postId}/like
	Task UnlikePostAsync(Guid postId, Guid currentUserId, CancellationToken ct); //+ DELETE /posts/{postId}/like
	
	
	//Comments
	Task<CommentPreviewDto> AddCommentAsync(Guid postId, Guid currentUserId, string content, CancellationToken ct); //+ POST /posts/{postId}/comments
	Task DeleteCommentAsync(Guid postId, Guid commentId, Guid currentUserId, CancellationToken ct); //+ DELETE /posts/{postId}/comments/{commentId}
}