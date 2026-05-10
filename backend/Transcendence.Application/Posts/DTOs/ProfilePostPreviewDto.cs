using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Application.Posts.DTOs;

public sealed class ProfilePostPreviewDto
{
	public Guid Id { get; set; }
	public Guid AuthorId { get; set; }
	
	public DateTime CreatedAtUtc { get; set; }
	public Guid ImageFileId { get; set; }
	public string? ImageUrl { get; set; }
	public string? ContentType { get; set; }
}
