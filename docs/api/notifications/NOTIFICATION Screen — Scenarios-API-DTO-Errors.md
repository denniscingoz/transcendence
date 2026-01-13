
## 1. Open notification panel

### Scenario

User clicks on the **notification bell icon** in the top bar.

### Behavior

- Notification panel slides in from the side
    
- Feed screen remains visible in background
    
- Notifications are loaded on open
    

### API call

`GET /notifications`

---

## 2. Load notifications list

### Endpoint

`GET /notifications`

---

### Query parameters

|Name|Type|Required|Description|
|---|---|---|---|
|page|integer|no|Page number (default: 1)|
|pageSize|integer|no|Items per page (default: 20, max: 50)|

📌 Pagination rules follow **global pagination contract**.

---

### Success Response (200 OK)

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "LIKE",
        "actor": {
          "id": "uuid",
          "username": "dipp_sardar",
          "avatarUrl": "https://cdn.app/avatar.jpg"
        },
        "postId": "uuid",
        "createdAt": "2026-01-07T08:30:00Z",
        "isRead": false
      }
    ]
  },
  "isSuccess": true,
  "errors": []
}
```

---

## 3. Notification types

|   |   |
|---|---|
|Type|Description|
|LIKE|Someone liked your post|
|COMMENT|Someone commented on your post|
|FOLLOW|Someone followed you|

📌 Frontend decides **visual representation** based on `type`.

---

## 4. Click on notification item

### Scenario

User clicks a notification item.

### Behavior

- Notification is marked as **read**
    
- User is navigated to related entity:
    
    - Post details (LIKE / COMMENT)
        
    - User profile (FOLLOW)
        

### API call

`POST /notifications/{notificationId}/read`

---

### Success Response

```
{
  "isSuccess": true
}
```

---

## 5. Mark all notifications as read (optional)

### Endpoint

`POST /notifications/read-all`

### Use case

- User clicks “Mark all as read”
    
- All unread notifications are marked as read
    

---

## 6. Error Handling (Standard)

All error responses use the **standard API envelope**.

### 401 Unauthorized

```json
{
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```

### 500 Internal Server Error

```json
{
  "isSuccess": false,
  "errors": ["Unable to load notifications"]
}
```

---

## 7. Notes

- Notifications are **read-only entities**
    
- No deletion from UI in v1
    
- Real-time updates may be added later via WebSocket / SSE
    
- `createdAt` is always **UTC ISO 8601**
    

---

## 8. Summary

- Notification panel loads paginated list
    
- Clicking notification performs navigation + read action
    
- Backend controls notification state
    
- UI remains lightweight and reactive