namespace Transcendence.Application.Posts.DTOs;
public sealed class LikeDto
{
	public int Id { get; init; }
	public Guid PostId { get; init; }
	public Guid AuthorId { get; init; }
	public DateTime CreatedAtUtc { get; init; }

}

