
*(Opened from Post Details by clicking likes counter)*

---

## 1. Open post likes screen

### Preconditions

* User is authenticated
* Post exists
* Post has at least one like

### Entry points

* Click on likes count in Post Details screen

### Behavior

* Modal window is opened
* List of users who liked the post is loaded
* Background screen remains visible but inactive

---

## 2. Load users who liked the post

### Endpoint

`GET /posts/{postId}/likes`

### Query Params

```
page        (number, optional, default = 1)
pageSize    (number, optional, default = 20)
```

### Success Response (200 OK)

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "username": "dipp_sardar",
        "fullName": "Dipprokash Sardar",
        "avatarUrl": "https://cdn.app/avatar.jpg",
        "isFollowedByMe": true
      }
    ]
  },
  "isSuccess": true,
  "errors": [],
  "metadata": {
    "totalCount": 128,
    "pageSize": 20,
    "currentPage": 1
  }
}
```

---

## 3. Follow / Unfollow user from likes list

### Endpoint

`POST /users/{userId}/follow`

### Success Response (200 OK)

```json
{
  "data": {
    "userId": "uuid",
    "isFollowed": true
  },
  "isSuccess": true,
  "errors": []
}
```

---

## 4. Open user profile

Navigation only — no API call

---

## 5. Close likes modal

Navigation only — no API call

---

## Response DTOs (Backend)

```cs
public class PostLikesResponseDto
{
    public List<PostLikeUserDto> Items { get; set; }
}

public class PostLikeUserDto
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

### 401 Unauthorized

```json
{
  
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```

### 404 Not Found

```json
{
  
  "isSuccess": false,
  "errors": ["Post not found"]
}
```

### 400 Bad Request

```json
{
  
  "isSuccess": false,
  "errors": ["Invalid pagination parameters"]
}
```
 