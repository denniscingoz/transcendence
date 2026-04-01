namespace Transcendence.Application.Chat.DTOs;

public enum NotificationType
{
    NewMessage = 1,
    MessageRead = 2,
    UserTyping = 3,
    UserOnline = 4,
    UserOffline = 5
}
public sealed class NotificationDto
{
    public Guid Id { get; init; }
    public NotificationType Type { get; init; } = default!;
    public object Payload { get; init; } = default!;
    public DateTimeOffset CreatedAt { get; init; }

    public static NotificationDto NewMessage(ChatMessageDto message)
    {
        return new NotificationDto
        {
            Id = Guid.NewGuid(),
            Type = NotificationType.NewMessage,
            Payload = message,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
/*
Это **асинхронный сигнал**, а не диалог.

= default! дай по умолчаниб нуль но там не будет нуль, не надо мне ляля

Примеры:

- “New message”
    
- “User followed you”
    
- “Comment on your post”
    

---

### **Почему notification ≠ message**

  

Потому что:

- у notification **нет диалога**
    
- они не требуют immediate reply
    
- они могут прийти **когда пользователь оффлайн** 
*/