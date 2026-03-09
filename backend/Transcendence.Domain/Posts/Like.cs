namespace Transcendence.Domain.Posts;
public sealed class Like
{
	public Guid Id { get; private set; }
	public Guid PostId { get; private set; }
	public Guid AuthorId { get; private set; }
	public DateTime CreatedAtUtc { get; private set; }
#pragma warning disable CS8618
	private Like() { } // EF Core
#pragma warning disable CS8618
	public Like(Guid likeId, Guid postId, Guid authorId)
	{
		if (postId == Guid.Empty) throw new ArgumentException("postId required.");
		if (authorId == Guid.Empty) throw new ArgumentException("userId required.");
		Id = likeId;
		PostId = postId;
		AuthorId = authorId;
		CreatedAtUtc = DateTime.UtcNow;
	}
}
