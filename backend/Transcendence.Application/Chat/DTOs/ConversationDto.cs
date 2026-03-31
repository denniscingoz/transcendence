namespace Transcendence.Application.Chat.DTOs;
public class ConversationDto
{
    public Guid Id { get; set; }
    public Guid TargetUserId { get; set; }
    public string LastMessage { get; set; } = "";
    public DateTimeOffset? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}