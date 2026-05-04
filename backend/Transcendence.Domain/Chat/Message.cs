using System.Runtime.Versioning;
using Transcendence.Domain.Exceptions;
namespace Transcendence.Domain.Chat;

public class Message
{
    public Guid Id {get; private set;}
    public Guid SenderId {get; private set;}
    public Guid ConversationId {get; private set;}
    public Guid ClientMessageId {get; private set;}
    public DateTimeOffset CreatedAt { get; private set; }
    public  string Content {get; private set;} = null!;
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    private Message () {} //EF
public Message(Guid conversationId, Guid userId, Guid clientMessageId, string content)
{
    if (string.IsNullOrWhiteSpace(content))
        throw new ArgumentException("Message content cannot be empty");

    Id = Guid.NewGuid();
    Content = content;
    SenderId = userId;
    ConversationId = conversationId;
    ClientMessageId = clientMessageId;
    CreatedAt = DateTimeOffset.UtcNow;
    IsDeleted = false;
    DeletedAt = null;
}

    public void Delete(DateTime deletedAt)
    {
        if (IsDeleted) return;

        IsDeleted = true;
        DeletedAt = deletedAt;
        Content = "🚫This message was deleted";
    }
}

