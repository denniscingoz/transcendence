namespace Transcendence.Domain.Posts;

public sealed class Comment
{
	public Guid Id { get; private set; }
	public Guid PostId { get; private set; }
	public Guid AuthorId { get; private set; }
	public DateTime CreatedAtUtc { get; private set; }
	public DateTime? UpdatedAtUtc { get; private set; }
	public string Content { get; private set; } = "";

#pragma warning disable CS8618
	private Comment() { } // EF Core
#pragma warning disable CS8618


	public Comment(Guid id, Guid postId, Guid authorId, string content)
	{
		if (id == Guid.Empty) throw new ArgumentException("id required.", nameof(id));
		if (postId == Guid.Empty) throw new ArgumentException("postId required.", nameof(postId));
		if (authorId == Guid.Empty) throw new ArgumentException("authorId required.", nameof(authorId));
		if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("content required.", nameof(content));

		Id = id;
		PostId = postId;
		AuthorId = authorId;
		Content = content;
		CreatedAtUtc = DateTime.UtcNow;
	}

	public void UpdateContent(string content)
	{
		if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("content required.", nameof(content));
		Content = content;
		UpdatedAtUtc = DateTime.UtcNow;
	}
}
