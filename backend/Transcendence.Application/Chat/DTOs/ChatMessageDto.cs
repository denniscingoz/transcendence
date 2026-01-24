namespace Transcendence.Application.Chat.DTOs;
public sealed class ChatMessageDto
{
    public Guid MessageId { get; init; }
    public Guid ConversationId { get; init; }
    public Guid SenderId { get; init; }
    public string Content { get; init; } = default!;
    public DateTimeOffset CreatedAt { get; init; }
}
/*
Это **факт**, а не намерение.


Сервер говорит:


> “Сообщение СОЗДАНО и СУЩЕСТВУЕТ”

---

### **Почему он идёт и в REST, и в SignalR**


Потому что:

- realtime → push
    
- REST → history / sync / pagination
    

  

👉 **Один факт — один DTO**

---

### **Почему тут нет** 

### **RecipientId**

  

Потому что:

- сообщение принадлежит **conversation**
    
- получатели — это **участники conversation**
    
- SignalR доставляет **по group**
namespace Transcendence.Application.Chat.DTOs;

(на фронт)
```cs
public sealed class ChatMessageDto
{
    public Guid MessageId { get; init; }
    public Guid SenderId { get; init; }
    public Guid RecipientId { get; init; }
    public string Content { get; init; } = default!;
    public DateTimeOffset CreatedAt { get; init; }
}
```

*/