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

    private Message () {} //EF
    public Message (Guid conversationId,  Guid userId, Guid clientMessageId, string content )
    {
        if (string.IsNullOrWhiteSpace(content))
            throw  new InvalidArgumentException("Message content cannot be empty");

        Id = Guid.NewGuid();
        Content = content ;
        SenderId = userId;
        ConversationId =  conversationId;
        ClientMessageId = clientMessageId;
        CreatedAt = DateTimeOffset.UtcNow;
    }
}