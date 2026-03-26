namespace Transcendence.Application.Posts.DTOs;
public sealed class LikeDto
{
	public Guid Id { get; init; }
	public Guid PostId { get; init; }
	public Guid AuthorId { get; init; }
	public DateTime CreatedAtUtc { get; init; }

}
