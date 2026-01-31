using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Application.Posts.DTOs;
public class PostDto
{
	public Guid Id { get; set; }
	public Guid AuthorId { get; set; }
	public string? ImageUrl { get; set; }

}
