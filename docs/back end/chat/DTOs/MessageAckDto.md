```cs
public sealed class MessageAckDto
{
    public Guid ClientMessageId { get; init; }
    public Guid MessageId { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}
```

Это **квитанция**.

Сервер говорит отправителю:

> “Я ПРИНЯЛ твоё сообщение и создал вот это”

### **Что он решает**

Без ack:

- клиент не знает:
    - доставлено?
    - сохранено?
    - можно ли убрать “часики”?
    
- повторная отправка = хаос

### **Почему это отдельный DTO**


Потому что:
- ack **НЕ сообщение**
- его получает **ТОЛЬКО отправитель**
- он связан с ClientMessageId, а не с UI