
namespace Transcendence.Domain.Chat;

public sealed class Conversation
{
    public readonly List<ConversationParticipant> _participants = new(); //new() creates empty List during creating object

    public IReadOnlyCollection<ConversationParticipant>  Participants => _participants.AsReadOnly();
    public Guid Id {get; private set; }

    public ConversationType Type {get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
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

} 