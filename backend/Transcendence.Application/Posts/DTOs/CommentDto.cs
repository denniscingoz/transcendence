namespace Transcendence.Application.Posts.DTOs;
public class CommentDto
{
	public int Id { get; set; }
	public Guid PostId { get; set; }
	public Guid AuthorId { get; set; }
	public DateTime CreatedAt { get; set; }
	public string Content { get; set; } = default!;

}

