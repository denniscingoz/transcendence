namespace Transcendence.Application.Chat.DTOs;
public class ConversationDto
{
    public Guid Id { get; set; }
    public Guid TargetUserId { get; set; }
    public string LastMessage { get; set; } = "";
}