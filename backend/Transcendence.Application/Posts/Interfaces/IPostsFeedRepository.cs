using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Application.Posts.Interfaces;
public interface IPostsFeedRepository
{
	/// <summary>
	/// Gets a page of posts for the feed, ordered by creation time descending.
	/// </summary>
	/// <param name="take">Number of posts to take.</param>
	/// <param name="cursor">Cursor for pagination (optional).</param>
	/// <param name="currentUserId">Current user's ID (for filtering and personalization).</param>
	/// <param name="ct">Cancellation token.</param>
	/// <returns>A page of posts with pagination info.</returns>
		Task<CursorPageDto<FeedPostRowDto>> GetFeedPageAsync(
			Guid currentUserId,
			int take,
			string? cursor,
			CancellationToken ct);
}
