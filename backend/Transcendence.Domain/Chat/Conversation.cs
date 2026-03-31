
namespace Transcendence.Domain.Chat;

public sealed class Conversation
{
    private readonly List<ConversationParticipant> _participants = new(); //new() creates empty List during creating object

    public IReadOnlyCollection<ConversationParticipant>  Participants => _participants; //?
    public Guid Id {get; private set; }

    public ConversationType Type {get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public string? LastMessageText { get; private set; }
    public DateTimeOffset? LastMessageAt { get; private set; }
    private Conversation() {} //EF

    public Conversation(ConversationType type, IEnumerable<Guid> participantsIds)
    {
        Id = Guid.NewGuid();
        Type = type;
        CreatedAt = DateTimeOffset.UtcNow;

        foreach(var userId in participantsIds.Distinct())
        {
            _participants.Add(new ConversationParticipant(Id, userId));
        }

    }
    public bool HasParticipant(Guid userId) => _participants.Any(p => p.UserId == userId);
    public void UpdateLastMessage(string content, DateTimeOffset createdAt)
    {
        LastMessageText = content;
        LastMessageAt = createdAt;
    }
} 