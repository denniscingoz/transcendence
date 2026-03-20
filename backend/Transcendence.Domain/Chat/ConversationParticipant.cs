using System.Text;

namespace Transcendence.Domain.Chat;

public sealed class ConversationParticipant
{
  public Guid UserId {get; private set;}
  public Guid ConversationId {get; private set;}
  public DateTimeOffset JoinedAt {get; private set;}
  public DateTimeOffset LastReadAt {get;  set;}



  private ConversationParticipant() {}

  public ConversationParticipant(Guid conversationId, Guid userId)
    {
        ConversationId = conversationId;
        UserId = userId;
        JoinedAt = DateTimeOffset.UtcNow;
    }

} 