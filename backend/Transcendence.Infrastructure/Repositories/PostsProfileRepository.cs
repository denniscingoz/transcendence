using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;

namespace Transcendence.Infrastructure.Repositories
{
	public class PostsProfileRepository : IPostsProfileRepository
	{

		public async Task<CursorPageDto<ProfilePostPreviewDto>> GetProfilePostsPreviewAsync(Guid targetUserId, int take, string? cursor, CancellationToken ct) { throw new NotImplementedException(); } // repository returns: Posts + NextCursor (cursor logic stays in repository)
		public async Task<CursorPageDto<CommentPreviewDto>> GetCommentsAsync(Guid postId, int take, string? cursor, CancellationToken ct) { throw new NotImplementedException(); } // repository returns: Comments + NextCursor (cursor logic stays in repository)
		public async Task<CursorPageDto<LikesPreviewDto>> GetLikesAsync(Guid postId, int take, string? cursor, CancellationToken ct) { throw new NotImplementedException(); } // repository returns: Likes + NextCursor (cursor logic stays in repository)

	}
}
