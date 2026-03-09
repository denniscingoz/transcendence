namespace Transcendence.Application.Posts.DTOs;

public sealed class LikesPreviewDto
{
	public int Id { get; init; }
	public Guid PostId { get; init; }
	public Guid AuthorId { get; init; }
	public DateTime CreatedAtUtc { get; init; }
	public string AuthorUsername { get; init; } = default!;
	public string AuthorProfileImageUrl { get; init; } = default!;

}
