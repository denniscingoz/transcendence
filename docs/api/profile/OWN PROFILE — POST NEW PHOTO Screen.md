
User creates a new post by uploading a photo from their own profile.

---

## **User scenarios**

### **1. Open post creation screen**

- User opens **Own Profile**
    
- Clicks **Add (+)** button
    
- Post creation screen opens
    
### **2. Upload photo**

- User drags image into upload area **or** clicks _Select from computer_
    
- Supported formats: jpg, png
    
- Max file size: defined by backend (e.g. 10MB)
    

### **3. Create post**

**Endpoint:  POST /profile/posts**

- User optionally adds caption
    
- Clicks **Post**
    
- Backend creates a new post
    
- User is redirected back to Own Profile
    
- New post appears at the top of the grid
    


Purpose: Upload a photo and create a new post for the current user.

Authentication: **Required**

---
## **Request**

**Content-Type:** multipart/form-data

| **Field** | **Type** | **Required** | **Description**              |
| --------- | -------- | ------------ | ---------------------------- |
| image     | file     | yes          | Image file (jpg, png)        |
| caption   | string   | no           | Post caption (max 300 chars) |

---

## **Response DTOs (Backend)**

```json
PostCreatedDto
{
  "id": "uuid",
  "imageUrl": "string",
  "caption": "string | null",
  "createdAt": "datetime"
}
```

---

## **Response (201 Created)**

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
}
```

---

## **Errors**

  

### **400 Validation Error**

```json
{
  "isSuccess": false,
  "errors": ["Invalid image format"]
}
```

### **413 Payload Too Large**

```json
{
  "isSuccess": false,
  "errors": ["File size exceeds limit"]
}
```

### **401 Unauthorized**

```json
{
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```