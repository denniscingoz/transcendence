using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Users.DTOs;
namespace Transcendence.Application.Posts.Interfaces;

public interface IPostsProfileService
{
	//GET /posts/me?take=20&cursor=<nextCursor>
	//GET /posts/by-username/{targetUserId}?take=20&cursor=<nextCursor>
	Task<CursorPageDto<ProfilePostPreviewDto>> GetProfilePostsPreviewAsync(Guid targetUserId, int take, string? cursor, Guid viewerId, CancellationToken ct);

	//GET /posts/{postId}/comments?take=20&cursor=<nextCursor>
	Task<CursorPageDto<CommentPreviewDto>> GetCommentsAsync(Guid postId, int take, string? cursor, Guid viewerId, CancellationToken ct);

	//GET /posts/{postId}/likes?take=20&cursor=<nextCursor>
	Task<CursorPageDto<LikesPreviewDto>> GetLikesAsync(Guid postId, int take, string? cursor, Guid viewerId, CancellationToken ct);
}
