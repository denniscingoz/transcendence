namespace Transcendence.Application.Chat.DTOs;
public sealed class MessageDeletedDto
{
    public Guid MessageId { get; init; }
    public Guid ConversationId { get; init; }
}