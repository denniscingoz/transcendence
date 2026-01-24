namespace Transcendence.Application.Chat.DTOs;

public sealed class NotificationDto
{
    public Guid Id { get; init; }
    public string Type { get; init; } = default!;
    public object Payload { get; init; } = default!;
    public DateTimeOffset CreatedAt { get; init; }
}
/*
Это **асинхронный сигнал**, а не диалог.

  

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