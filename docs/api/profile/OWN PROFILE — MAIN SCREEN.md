  

User views their own profile page with avatar, bio, counters, and posts grid.

## **User scenarios**

### **1. Open Own Profile screen**


**Endpoint:** GET /profile/me

- User navigates to **Profile** tab (bottom navigation)
    
- Screen loads current user profile data:
    
    - avatar
        
    - full name
        
    - username
        
    - bio
        
    - counters (posts / followers / following)
        
    

### **2. Load posts grid**


**Endpoint:** GET /profile/me/posts

- Posts grid is loaded (user’s own posts)
    
- Grid contains:
    
    - “Add (+)” tile (first tile)
        
    - existing posts (image thumbnails)
        
    
- Grid supports pagination (scroll to load more)
    

### **3. Open post details**


**Endpoint:** GET /posts/{postId}

- User clicks a post thumbnail
    
- Post details modal opens (image + comments + likes)
    
- Post data and comments are displayed
    

### **4. Open followers list**
  

**Endpoint:** GET /profile/me/followers

- User clicks **Followers** counter
    
- Followers modal opens
    
- Followers list is loaded (paginated + searchable)
    

### **5. Open following list**
 

**Endpoint:** GET /profile/me/following

- User clicks **Following** counter
    
- Following modal opens
    
- Following list is loaded (paginated + searchable)
    
### **6. Navigate to Edit Profile**  

Navigation only — No API call

- User clicks **Edit profile**
    
- Edit Profile screen opens
    

---

### **7. Navigate to Settings**


Navigation only — No API call

- User clicks **Settings**
    
- Settings screen opens
    

### **8. Create new post**


Navigation only — No API call

- User clicks **Add (+)** tile
    
- Post New Photo screen opens
    

---

## **API Endpoints**

- GET /profile/me — load current user profile header data
    
- GET /profile/me/posts — load current user posts grid (paginated)
    
- GET /posts/{postId} — open post details
    
- GET /profile/me/followers — list followers (paginated/searchable)
    
- GET /profile/me/following — list following (paginated/searchable)
    

---

## **Request (Query Parameters)**

  

### **GET /profile/me/posts**

|**Name**|**Type**|**Required**|**Description**|
|---|---|---|---|
|page|integer|no|Page number (default: 1)|
|pageSize|integer|no|Items per page (default: 20, max: 50)|

---

### **GET /profile/me/followers**

###  **and** 

### **GET /profile/me/following**

|**Name**|**Type**|**Required**|**Description**|
|---|---|---|---|
|page|integer|no|Page number (default: 1)|
|pageSize|integer|no|Items per page (default: 20, max: 50)|
|q|string|no|Search by username or full name|

---

## **Response DTOs (Backend)**

```cs
public class MyProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string FullName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }

    public int PostsCount { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
}

public class ProfilePostThumbDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MyPostsGridResponseDto
{
    public List<ProfilePostThumbDto> Items { get; set; }
}
```

---

## **Responses**

  

### **GET /profile/me**

###  **(200 OK)**

```json
{
  "isSuccess": true,
  "errors": [],
  "data": {
    "id": "uuid",
    "username": "dipp_sardar",
    "fullName": "Dippokash Sardar",
    "bio": "Welcome to my profile!! ...",
    "avatarUrl": "string | null",
    "postsCount": 100,
    "followersCount": 720,
    "followingCount": 1200
  }
}
```

---

### **GET /profile/me/posts**

###  **(200 OK)**

```json
{
  "isSuccess": true,
  "errors": [],
  "metadata": {
    "totalCount": 100,
    "pageSize": 20,
    "currentPage": 1
  },
  "data": {
    "items": [
      {
        "id": "uuid",
        "imageUrl": "string",
        "createdAt": "datetime"
      }
    ]
  }
}
```

---

## **Errors**

  

### **401 Unauthorized**

```json
{
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```

---

### **400 Validation Error (Pagination)**

```json
{
  "isSuccess": false,
  "errors": ["Invalid pagination parameters"]
}
```