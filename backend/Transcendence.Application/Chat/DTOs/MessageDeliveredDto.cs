namespace Transcendence.Application.Chat.DTOs;

public sealed class MessageDeliveredDto
{
    public Guid ReaderId { get; init; }
    public Guid MessageId { get; init; }
}