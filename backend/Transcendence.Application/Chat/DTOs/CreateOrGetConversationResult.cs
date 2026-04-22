namespace Transcendence.Application.Chat.DTOs;

public sealed class CreateOrGetConversationResult
{
    public Guid ConversationId { get; init; }
    public bool IsCreated { get; init; }
}