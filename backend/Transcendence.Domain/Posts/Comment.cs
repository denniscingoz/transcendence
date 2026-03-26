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
#pragma warning restore CS8618


	public Comment(Guid id, Guid postId, Guid authorId, string content)
	{
		if (id == Guid.Empty) throw new ArgumentException("id required.", nameof(id));
		if (postId == Guid.Empty) throw new ArgumentException("postId required.", nameof(postId));
		if (authorId == Guid.Empty) throw new ArgumentException("authorId required.", nameof(authorId));
		//if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("content required.", nameof(content));

		Id = id;
		PostId = postId;
		AuthorId = authorId;
		Content = NormalizeRequiredContent(content, nameof(content));
		CreatedAtUtc = DateTime.UtcNow;
	}

	public void UpdateContent(string content)
	{
		Content = NormalizeRequiredContent(content, nameof(content));
		UpdatedAtUtc = DateTime.UtcNow;
	}
	
	private static string NormalizeRequiredContent(string content, string paramName)//added trimming to check for empty content "    "
	{
		var trimmed = content?.Trim();
		if (string.IsNullOrEmpty(trimmed))
			throw new ArgumentException("content required.", paramName);
		if (trimmed.Length > 1000) // same control as in PostsService to ensure it's not bypassed
			throw new ArgumentException("content must be <= 1000 characters.", paramName);

		return trimmed;
	}
}
