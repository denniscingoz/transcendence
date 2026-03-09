using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Application.Posts.Interfaces;

public interface IPostsProfileRepository
{

	//GET /posts/me?take=20&cursor=<nextCursor>
	//GET /posts/by-userId/{targetUserId}?take=20&cursor=<nextCursor>
	Task<CursorPageDto<ProfilePostPreviewDto>> GetProfilePostsPreviewAsync(Guid targetUserId, int take, string? cursor, CancellationToken ct); // repository returns: Posts + NextCursor (cursor logic stays in repository)

	//GET /posts/{postId}/comments?take=20&cursor=<nextCursor>
	Task<CursorPageDto<CommentPreviewDto>> GetCommentsAsync(Guid postId, int take, string? cursor, CancellationToken ct); // repository returns: Comments + NextCursor (cursor logic stays in repository)
	
	//GET /posts/{postId}/likes?take=20&cursor=<nextCursor>
	Task<CursorPageDto<LikesPreviewDto>> GetLikesAsync(Guid postId, int take, string? cursor, CancellationToken ct); // repository returns: Likes + NextCursor (cursor logic stays in repository)
}
