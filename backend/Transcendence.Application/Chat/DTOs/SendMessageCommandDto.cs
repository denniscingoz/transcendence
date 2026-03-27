namespace Transcendence.Application.Chat.DTOs;

public sealed class SendMessageCommandDto
{
    public Guid ConversationId { get; set; }
    public Guid ClientMessageId { get; set; }
    public string Content { get; set; } = default!;
}
/*

### **Зачем он нужен**

  
Это **намерение**, а не сообщение.

Клиент говорит:

> “Я ХОЧУ отправить сообщение в этот conversation”

Он **не утверждает**, что сообщение уже существует.

### **Почему он НЕ** 

### **ChatMessageDto**

  
Потому что:

- у него ещё нет MessageId
- сервер ещё может:
    - отклонить (403, 404)
    - отложить
    - дедуплицировать
        
    

---

### **Почему тут** 

### **ClientMessageId**

  

Это **ключ к надёжности**.

  

Без него:

- повторная отправка = дубль
- плохой интернет = сломанный UX
- ack невозможен


👉 ClientMessageId позволяет:

- retry без дублей
- корректный optimistic UI */