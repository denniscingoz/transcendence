_(Opened from Feed by clicking post image or comments icon)_
## **1.  Open post details screen**

### **Preconditions**

- User is authenticated
- Post exists
- Post is accessible (not deleted / not blocked)
### **Entry points**

- Click on post image in Feed
- Click on comments icon in Feed
### **Behavior**

- Post image is displayed in full size
- Comments panel is opened on the right
- Existing comments are loaded automatically

## **2. Load posts details**
#### **Endpoint** GET /posts/{postId}

##### **Success Response (200 OK)**
```json
{
  "data": {
    "id": "uuid",
    "author": {
      "id": "uuid",
      "username": "john_doe",
      "avatarUrl": "https://cdn.app/avatar.jpg"
    },
    "imageUrl": "https://cdn.app/post.jpg",
    "caption": "It was the best view that I needed to share with all of you",
    "likesCount": 128,
    "isLikedByMe": true,
    "createdAt": "2026-01-04T10:15:00Z"
  },
  "isSuccess": true,
  "errors": []
}
```

## **3. Load comments**

###### **Endpoint** GET /{postId}/comments

 #### **Query params**
```json
page        (number, optional, default = 1)
pageSize    (number, optional, default = 10)
```

##### **Success Response (200 OK)**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "text": "Nice pic man, proud of you!",
        "author": {
          "id": "uuid",
          "username": "joyprakash"
        },
        "createdAt": "2026-01-04T11:00:00Z"
      }
    ]
  },
  "isSuccess": true,
  "errors": [],
  "metadata": {
    "totalCount": 42,
    "pageSize": 10,
    "currentPage": 1
  }
}
```


## **4. Add comment**

###### **Endpoint** POST /posts/{postId}/comments

#### **Request DTO**
```json
{
  "text": "Amazing view!"
}
```

##### **Success Created (201 OK)**
```json
{
  "data": {
    "id": "uuid",
    "text": "Amazing view!",
    "author": {
      "id": "uuid",
      "username": "john_doe"
    },
    "createdAt": "2026-01-04T12:00:00Z"
  },
  "isSuccess": true,
  "errors": []
}
```

- Backend returns full comment so UI can append it immediately.

## **5. Like / Unlike post**

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

## **6. Delete own comment***

###### **Endpoint** DELETE /comments/{commentId}
### **Preconditions**

- User is author of the comment **OR**
- User has moderation permissions


 #### **Success Response (200 OK)**
```json
{
  
  "isSuccess": true,
  "errors": []
}
```
## **7. Delete own post

###### **Endpoint** DELETE /posts/{postId}
### **Preconditions**

- User is author of the post

 #### **Success Response (200 OK)**
```json
{
  
  "isSuccess": true,
  "errors": []
}
```

After deletion:

- Modal is closed
- Feed is refreshed or updated locally
## Response DTOs (Backend)
```json
public class PostDetailsDto
{
    public Guid Id { get; set; }
    public UserShortDto Author { get; set; }
    public string ImageUrl { get; set; }
    public string Caption { get; set; }
    public int LikesCount { get; set; }
    public bool IsLikedByMe { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CommentDto
{
    public Guid Id { get; set; }
    public string Text { get; set; }
    public UserShortDto Author { get; set; }
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
#### **403 Bad Request**
```json
{
  
  "isSuccess": false,
  "errors": ["Access denied"]
}
```
#### **404 Not found**
```json
{
  
  "isSuccess": false,
  "errors": ["Post not found"]
}
```
####  **422 Unprocessable Entity**
```json
{
  
  "isSuccess": false,
  "errors": ["Comment text must not be empty"]
}
```

- Comments are paginated
- Likes count is backend-authoritative
- Delete button is visible only for post owner
- Modal close does not trigger logout or navigation reset