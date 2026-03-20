namespace Transcendence.Application.Chat.DTOs;

public sealed class MessageReadDto
{
    public Guid ConversationId { get; init; }
    public Guid ReaderId { get; init; }
    public Guid MessageId { get; init; } 
}