namespace Transcendence.Application.Chat.DTOs;

public sealed class CreateDirectConversationDto
{
    public Guid TargetUserId { get; init; }
}