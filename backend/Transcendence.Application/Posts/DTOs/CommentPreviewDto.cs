namespace Transcendence.Application.Posts.DTOs;
public sealed class CommentPreviewDto
{
	public Guid Id { get; set; }
	public Guid PostId { get; set; }
	public Guid AuthorId { get; set; }
	public DateTime CreatedAtUtc { get; set; }
	public string Content { get; set; } = default!;

	public string Username { get; set; } = default!;
	public string FullName { get; set; } = default!;
	public string AuthorProfileImageUrl { get; set; } = default!;

}
