
User adds caption to an uploaded photo and publishes the post.

## **User scenarios**

### **1. Open post caption screen**

- User uploads a photo from **Own Profile**
- After successful image upload, caption screen opens
- Uploaded image preview is displayed
- Caption input field is available

### **2. Add caption**

- User types text into **Post Bio** field
- Caption is optional
- Max length: 250 characters
- Character counter is displayed

### **3. Share post**

**Endpoint:** `POST /profile/posts`

- User clicks **Share**
- Backend creates a new post with image + caption
- User is redirected back to **Own Profile**
- New post appears at the top of the posts grid

**Purpose:**  
Finalize post creation by adding caption and publishing the post.

**Authentication:** **Required**

---

## **Request**

**Content-Type:** `multipart/form-data`

| Field   | Type   | Required | Description                       |
| ------- | ------ | -------- | --------------------------------- |
| image   | file   | yes      | Image file (jpg, png)             |
| caption | string | no       | Post caption (max 250 characters) |

---

## **Response DTOs (Backend)**

```csharp
public class PostCreatedDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; }
    public string? Caption { get; set; }
    public DateTime CreatedAt { get; set; }
}```

## Response DTOs (Backend)

```json
{
  "isSuccess": true,
  "errors": [],
  "data": {
    "id": "uuid",
    "imageUrl": "string",
    "caption": "string | null",
    "createdAt": "datetime"
  }
}```
## **Errors**

### **400 Validation Error**
```json
{
  "isSuccess": false,
  "errors": ["Caption exceeds maximum length"]
}
```

### **413 Payload Too Large**
```json
{
  "isSuccess": false,
  "errors": ["File size exceeds limit"]
}
```

### **401 Validation Error**
```json
{
  "isSuccess": false,
  "errors": ["Unauthorized"]
}```
