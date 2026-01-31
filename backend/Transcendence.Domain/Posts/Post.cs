namespace Transcendence.Domain.Posts;

public sealed class Post //minimal, preliminary 
{
    public Guid Id {get; private set; }
    public Guid AuthorId {get; private set; }
    public DateTime CreatedAt {get; private set; }
    public string? Content {get; private set; }
	public string ImageUrl {get; private set; } = default!;
	public int LikesCount { get; set; }
	public List<Likes> Likes { get; private set; } = new();
	public List<Comment> Comments { get; private set; } = new();

	private Post () {}

    public Post (Guid id, Guid authorId)
    {
        Id = id;
        AuthorId = authorId;
        CreatedAt = DateTime.UtcNow;
    }
}