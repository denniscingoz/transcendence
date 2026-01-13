## 1. Open search panel

**Trigger:**
User clicks **Search** icon in bottom navigation.

**Behavior:**

* Search panel slides in
* Focus is set to search input
* No API call yet

## 2. Type search query

**Trigger:**
User types text into search input.

**Notes (front):**

* Search is **debounced** (e.g. 300–500 ms)
* Empty string → no request
* Minimum length (recommended): `2`

## 3. Search users

### Endpoint `GET /search/users`

### Query parameters

| Name       | Type   | Required | Description                         |
| ---------- | ------ | -------- | ----------------------------------- |
| `q`        | string | yes      | Search query (username / full name) |
| `page`     | number | no       | Page number (default: 1)            |
| `pageSize` | number | no       | Page size (default: 20)             |
**example:** GET /search/users?q=dipp&page=2&pageSize=20
### ✅ Success response (200 OK)

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "username": "dipp_sardar",
        "fullName": "Dippokash Sardar",
        "avatarUrl": "https://...",
        "isFollowedByMe": true
      }
    ]
  },
  "isSuccess": true,
  "errors": []
}
```

## 4. Click user in search results

**Behavior:**

* Navigate to **User Profile screen**
* No new API call at this moment (profile screen handles it)

## 5. Clear search input

**Trigger:**
User clicks ❌ icon.

**Behavior:**

* Input cleared
* Results cleared
* No API call

---

## Response DTOs (Backend)

```csharp
public class SearchUsersResponseDto
{
    public List<SearchUserItemDto> Items { get; set; }
}

public class SearchUserItemDto
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string FullName { get; set; }
    public string AvatarUrl { get; set; }
    public bool IsFollowedByMe { get; set; }
}
```

---

## Error Handling (Standard)

### 400 Bad Request

```json
{
  
  "isSuccess": false,
  "errors": ["Search query is required"]
}
```

### 422 Unprocessable Entity

```json
{
  
  "isSuccess": false,
  "errors": ["Search query must be at least 2 characters"]
}
```
