using System.Runtime.Versioning;

namespace Transcendence.Domain.Chat;

public class Message
{
    public Guid Id {get; private set;}
    public Guid SenderId {get; private set;}
    public Guid ConversationId {get; private set;}
    public Guid ClientMessageId {get; private set;}
    public DateTimeOffset CreatedAt { get; private set; }
    public  string Content {get; private set;} 

    private Message () {} //EF
    public Message (Guid conversationId,  Guid userId, Guid ClientMessageId, string content )
    {
        if (string.IsNullOrWhiteSpace(content))
            throw ArgumentException("Message content cannot be empty");

        Id = Guid.NewGuid();
        Content = content;
        SenderId = userId;
        ConversationId =  conversationId;
        CreatedAt = DateTimeOffset.UtcNow;
    }
}