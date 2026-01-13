namespace Transcendence.Domain.Posts;

public sealed class Post //minimal, preliminary 
{
    public Guid Id {get; private set; }
    public Guid AuthorId {get; private set; }
    public DateTime CreatedAt {get; private set; }
    
    private Post () {}

    public Post (Guid id, Guid authorId)
    {
        Id = id;
        AuthorId = authorId;
        CreatedAt = DateTime.UtcNow;
    }
}