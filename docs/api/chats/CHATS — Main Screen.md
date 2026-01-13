
Private real-time messaging between users.

Authentication: **Required**

## **Screen structure**

### **Left panel — Chats list**

- List of conversations
    
- Avatar + username
    
- Last message preview
    
- Timestamp
    
- Unread counter

### **Right panel — Active chat**

- Message history
    
- Incoming / outgoing bubbles
    
- Message input field
    
## **User scenarios**

### **1. Open chats screen**

- User clicks **Messages** icon
    
- Chats screen opens
    
- Conversations list loads
    
**Endpoint**

```
GET /chats
```

Purpose: Load all user conversations.

### **2. Select chat**

- User clicks a chat
    
- Message history loads
    
- Realtime connection established
    

**Endpoints**

```
GET /chats/{chatId}/messages
WS /hubs/chat
```

### **3. Receive messages (Realtime)**

- Other user sends message
    
- Backend pushes message
    
- UI updates instantly
    

Transport: **WebSocket / SignalR**

### **4. Send message**

- User types message
    
- Clicks Send
    
- Message sent via realtime channel
    
Transport:

```
WS event: SendMessage
```

### **5. Read messages**

- Chat becomes active
    
- Messages marked as read
    
**Endpoint (optional)**

```
POST /chats/{chatId}/read
```

---
## **DTOs (Backend)**

### **ChatListItemDto**

```
{
  "chatId": "uuid",
  "user": {
    "id": "uuid",
    "username": "string",
    "avatarUrl": "string"
  },
  "lastMessage": "string",
  "lastMessageAt": "datetime",
  "unreadCount": 3
}
```

### **MessageDto**

```
{
  "id": "uuid",
  "chatId": "uuid",
  "senderId": "uuid",
  "text": "string",
  "createdAt": "datetime",
  "isMine": true
}
```

---

### **SendMessageRequest (Realtime)**

```
{
  "chatId": "uuid",
  "text": "string"
}
```

---

## **API responses**

### **GET /chats**

```
{
  "isSuccess": true,
  "errors": [],
  "data": []
}
```

### **GET /chats/{chatId}/messages**

```
{
  "isSuccess": true,
  "errors": [],
  "data": []
}
```

---

## **Errors**

### **401 Unauthorized**

```
{
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```

### **404 Chat not found**

```
{
  "isSuccess": false,
  "errors": ["Chat not found"]
}
```

# **CHATS — API Contracts & Architecture**

  

This document defines **HTTP Swagger**, **AsyncAPI (Realtime)**, **SignalR Hub contract**, and **.NET backend layout** for Chats.

---

## **1. HTTP API (Swagger)**

  

### **GET /chats**

  

Load user conversations.

  

**Response 200**

```
{
  "isSuccess": true,
  "errors": [],
  "data": [ChatListItemDto]
}
```

---

### **GET /chats/{chatId}/messages**

  

Load chat message history.

  

Query parameters:

- page (default 1)
    
- pageSize (default 20, max 50)
    

  

**Response 200**

```
{
  "isSuccess": true,
  "errors": [],
  "data": [MessageDto]
}
```

---

### **POST /chats/{chatId}/read**

  

Mark messages as read.

  

**Response 200**

```
{
  "isSuccess": true,
  "errors": []
}
```

---

## **2. AsyncAPI (Realtime Messaging)**

  

### **Channel: /hubs/chat**

  

#### **Client → Server**

##### **SendMessage**

```
{
  "chatId": "uuid",
  "text": "string"
}
```

---

#### **Server → Client**

##### **ReceiveMessage**

```
{
  "id": "uuid",
  "chatId": "uuid",
  "senderId": "uuid",
  "text": "string",
  "createdAt": "datetime",
  "isMine": false
}
```

---

##### **MessagesRead**

```
{
  "chatId": "uuid",
  "readAt": "datetime"
}
```

---

## **3. SignalR Hub Contract**

  

### **Hub: ChatHub**

  

#### **Client methods**

```
Task SendMessage(Guid chatId, string text);
Task MarkAsRead(Guid chatId);
```

---

#### **Server events**

```
Task ReceiveMessage(MessageDto message);
Task MessagesRead(Guid chatId);
```

---

## **4. DTOs**

  

### **ChatListItemDto**

```
{
  "chatId": "uuid",
  "user": {
    "id": "uuid",
    "username": "string",
    "avatarUrl": "string"
  },
  "lastMessage": "string",
  "lastMessageAt": "datetime",
  "unreadCount": 3
}
```

---

### **MessageDto**

```
{
  "id": "uuid",
  "chatId": "uuid",
  "senderId": "uuid",
  "text": "string",
  "createdAt": "datetime",
  "isMine": true
}
```

---

## **5. .NET Backend Architecture**

```
Transcendence.Api
 └── Chats
     ├── ChatHub.cs
     ├── ChatEndpoints.cs

Transcendence.Application
 └── Chats
     ├── Abstractions
     │   └── IChatService.cs
     ├── Services
     │   └── ChatService.cs
     └── DTOs
         ├── MessageDto.cs
         └── ChatListItemDto.cs

Transcendence.Infrastructure
 └── Chats
     ├── ChatRepository.cs
     └── SignalR
```

---

## **6. Responsibility split**

- **Controllers / Endpoints** — validation, auth
    
- **ChatService** — business logic
    
- **ChatHub** — realtime delivery
    
- **Repository** — persistence
    

---

## **Key principles**

- One DTO for HTTP & Realtime
    
- Backend is source of truth
    
- Realtime = push, HTTP = init/history
    
- UI never compares userIds
    

---

This contract is stable and scalable.