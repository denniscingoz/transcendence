using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Application.Posts.Interfaces;
public interface IPostsFeedService
{
	Task<CursorPageDto<PostDto>> GetFeedAsync(int take, string? cursor, Guid currentUserId, CancellationToken ct);
}

