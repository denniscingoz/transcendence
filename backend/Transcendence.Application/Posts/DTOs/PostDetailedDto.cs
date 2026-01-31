using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Application.Posts.DTOs;
public class PostDetailedDto
{
	public Guid Id { get; set; }
	public Guid AuthorId { get; set; }
	public string username { get; set; } = default!;
	public string fullName { get; set; } = default!;
	public string AuthorProfileImageUrl { get; set; } = default!;
	public DateTime CreatedAt { get; set; }
	public string Content { get; set; } = default!;
	public string? ImageUrl { get; set; }
	public int LikesCount { get; set; }
	public List<CommentDto> Comments { get; set; } = new();
}
