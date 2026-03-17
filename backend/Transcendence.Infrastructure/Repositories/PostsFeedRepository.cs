
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;

namespace Transcendence.Infrastructure.Repositories;
public sealed class PostsFeedRepository : IPostsFeedRepository
{
	public async Task<CursorPageDto<FeedPostRowDto>> GetFeedPageAsync(
		Guid currentUserId,
		int take,
		string? cursor,
		CancellationToken ct)
	{
		throw new NotImplementedException();
	}
}
