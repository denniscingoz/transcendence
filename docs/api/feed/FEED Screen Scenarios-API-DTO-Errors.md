## **1.  Open feed screen**

### **Preconditions**

- User is authenticated
- Access token is present
### **Behavior**

- Feed is loaded automatically
- Posts are displayed in chronological order (latest first)

## **2. Load feed posts**
#### **Endpoint** GET /feed

#### **Query Params**
```ts
page        (number, optional, default = 1)
pageSize    (number, optional, default = 10)
}```
#### **Success Response (200 OK)**
```json{
  "data": {
    "items": [
      {
        "id": "uuid",
        "author": {
          "id": "uuid",
          "username": "john_doe",
          "avatarUrl": "https://cdn.app/avatar.jpg"
        },
        "imageUrl": "https://cdn.app/post.jpg",
        "location": "Medinipur",
        "likesCount": 7500,
        "commentsCount": 425,
        "isLikedByMe": true,
        "createdAt": "2026-01-04T10:15:00Z"
      }
    ]
  },
  "isSuccess": true,
  "errors": [],
  "metadata": {
    "totalCount": 120,
    "pageSize": 10,
    "currentPage": 1
  }
}```

## **3. Like / Unlike post**

###### **Endpoint** POST /posts/{postId}/like

 #### **Success Response (200 OK)**
```json
{
  "data": {
    "postId": "uuid",
    "isLiked": true,
    "likesCount": 7501
  },
  "isSuccess": true,
  "errors": []
}
```


## **4. Open comments**

Navigation only — **No API call**

- Opens comments screen for selected post
## **5. Open user profile**

Navigation only — **No API call**

 - Navigates to public profile of post author

## **6. Infinite scroll / load next page**

Triggered when user scrolls near bottom.
###### **Endpoint** GET /feed?page=2&pageSize=10

- Uses same response format as initial load

## Response DTOs (Backend)
```json
public class FeedResponseDto
{
    public List<FeedPostDto> Items { get; set; }
}

public class FeedPostDto
{
    public Guid Id { get; set; }
    public UserShortDto Author { get; set; }
    public string ImageUrl { get; set; }
    public string Location { get; set; }
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public bool IsLikedByMe { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

## **Error Handling (Standard)**

All error responses follow the standard API envelope.
#### **401 Unauthorized**
```json
{
  
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```
#### **400 Bad Request**
```json
{
  
  "isSuccess": false,
  "errors": ["Invalid pagination parameters"]
}
```
### **500 Internal Sever Error**
```json
{
  
  "isSuccess": false,
  "errors": ["Unexpected server error"]
}
```

- Feed ordering is backend-defined
- isLikedByMe depends on current user
- Metadata is required for pagination
- UI must support empty state (no posts)
 