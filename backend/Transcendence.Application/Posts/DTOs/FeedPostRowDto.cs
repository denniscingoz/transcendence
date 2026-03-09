namespace Transcendence.Application.Posts.DTOs;
public sealed class FeedPostRowDto
{
	public Guid Id { get; set; }
	public Guid AuthorId { get; set; }
	public DateTime CreatedAtUtc { get; set; }
	public string? Content { get; set; }
	public string? ImageUrl { get; set; }
	public bool IsLikedByCurrentUser { get; set; }
	public int LikesCount { get; set; }
	public string AuthorFullName { get; set; } = default!;
	public string AuthorUsername { get; set; } = default!;
	public string? AuthorAvatarUrl { get; set; }

}
