using System.Text;

namespace Transcendence.Domain.Chat;

public sealed class ConversationParticipant
{
  public Guid UserId {get; private set;}
  public Guid ConversationId {get; private set;}
  public DateTime JoinedAt {get; private set;}


  private ConversationParticipant() {}

  public ConversationParticipant(Guid conversationId, Guid userId)
    {
        ConversationId = conversationId;
        UserId = userId;
        JoinedAt = DateTimeOffset.UtcNow;
    }

} 