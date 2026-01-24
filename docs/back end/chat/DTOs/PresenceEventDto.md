
Transcendence.Application.Chat.DTOs;
```cs
public sealed class UserPresenceDto
{
    public Guid UserId { get; init; }
    public bool IsOnline { get; init; }
    public DateTimeOffset ChangedAt { get; init; }
}
```

UserOnline(UserPresenceDto)
UserOffline(UserPresenceDto)

будут слаться в группу user:{friendId} или friends:* (позже)

resence — это **состояние**, а не событие чата.

  
Он отвечает на вопрос:

> “Этот пользователь сейчас доступен?”

---

### **Почему presence — отдельный поток**

  
Потому что:

- он не связан с conversation
- он нужен в:
    - friends list
    - header
    - chat list
        
- он живёт **по userId**, а не по chatId