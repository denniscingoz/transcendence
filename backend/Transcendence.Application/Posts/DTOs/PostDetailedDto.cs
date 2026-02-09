using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Application.Posts.DTOs;
public sealed class PostDetailedDto
{
	public Guid Id { get; init; }
	public Guid AuthorId { get; init; }
	public DateTime CreatedAtUtc { get; init; }
	public string? Content { get; init; }
	public required string ImageUrl { get; init; }

	// These are not stored in the Post entity but are calculated on the fly for the DTO.
	public int LikesCount { get; init; }
	public IReadOnlyList<CommentDto> Comments { get; init; } = Array.Empty<CommentDto>();

	//From User
	public string Username { get; init; } = default!;
	public string FullName { get; init; } = default!;
	public string? AuthorProfileImageUrl { get; init; }
}
