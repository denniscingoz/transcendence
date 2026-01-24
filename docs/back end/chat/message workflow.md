```
Client
  │
  │ SendMessageCommandDto
  ▼
SignalR Hub
  │
  │ (Application + Domain)
  ▼
Database
  │
  │ ChatMessageDto
  ▼
SignalR Group (conv:{id})
  │
  ├─> Other clients → MessageReceived
  │
  └─> Sender → MessageAck
```



 
```
┌──────────┐
│ Frontend │
│  (UI)    │
└────┬─────┘
     │
     │ invoke("SendMessage", SendMessageCommandDto)
     │
     ▼
┌────────────────────┐
│ SignalR ChatHub    │   ← ME (realtime transport)
│                    │
│ - get senderId     │
│ - no business logic│
└────┬───────────────┘
     │
     │ call
     │ IChatService.SendMessageAsync(...)
     │
     ▼
┌────────────────────┐
│ Application Layer  │   ← ELSE ownership
│ ChatService        │
│                    │
│ - permissions      │
│ - domain rules     │
│ - create message   │
└────┬───────────────┘
     │
     │ save
     │
     ▼
┌────────────────────┐
│ Infrastructure     │   ← ELSE ownership
│ Repository / EF    │
│                    │
│ - SQL              │
│ - persistence      │
└────┬───────────────┘
     │
     │ return
     │ ChatMessageDto
     │
     ▼
┌────────────────────┐
│ SignalR ChatHub    │   ← again ME
│                    │
│ - route message    │
│ - broadcast event  │
└────┬───────────────┘
     │
     │ push "MessageReceived"
     │ ChatMessageDto
     │
     ▼
┌──────────┐   ┌──────────┐
│ Client A │   │ Client B │
│ (sender) │   │(receiver)│
└──────────┘   └──────────┘
```