```
User
├── Auth
│   ├── Register
│   ├── Login
│   ├── Logout
│   ├── Refresh session
│   └── Reset password
│
├── Profile
│   ├── View profile
│   ├── Edit profile
│   ├── Follow user
│   └── Unfollow user
│
├── Feed
│   ├── View feed
│   ├── Load next page
│   ├── Refresh feed
│   └── View single post
│
├── Post
│   ├── Create post
│   ├── Edit post
│   ├── Delete post
│   └── Attach media
│
├── Interaction
│   ├── Like post
│   ├── Unlike post
│   ├── Comment post
│   ├── Edit comment
│   └── Delete comment
│
├── Moderation
│   ├── Auto-check content (AI)
│   ├── Report content
│   ├── Review moderation result
│   └── Content blocked / approved
│
├── Notifications
│   ├── New like
│   ├── New comment
│   ├── New follower
│   └── Moderation status
│
└── Settings
    ├── Change language
    ├── Privacy settings
    └── Account delete
 
```
## **1️⃣ Registration & Login**

### **🧾 Registration**


**Goal:** create a new user account.

**Steps:**

1. User enters email and password
2. System validates input
3. Password is securely stored
4. User account is created
5. Default profile is created
6. User can log in

**Result:**
User exists in the system and can authenticate.

### **🔐 Login**

**Goal:** authenticate an existing user.

**Steps:**
1. User enters email and password
2. System verifies credentials
3. Authentication token is issued
4. Token is used for further requests

**Result:**
User is authenticated and can access protected features.

---

## **2️⃣ Profile Management**

### **👤 View Profile**


**Goal:** view public user information.

**Steps:**
1. User opens a profile page
2. System loads profile data
3. Privacy rules are applied
    
### **✏️ Edit Profile**

**Goal:** update personal profile information.

**Steps:**
1. User opens profile settings
2. Updates avatar, display name, bio
3. System validates and saves changes
    

## **3️⃣ Create and View Posts**

### **📝 Create Post**

**Goal:** publish new content.

**Steps:**
1. Authenticated user writes a post
2. Post is saved
3. Content is checked by moderation
4. Post is marked as active or hidden
    
**Result:**
Post becomes visible (or hidden if moderation applies).

### **👀 View Feed**

**Goal:** see posts from other users.

**Steps:**
1. User opens feed
2. System loads posts based on relationships
3. Only active posts are returned
## **4️⃣ Interactions with Content**

  
### **❤️ Like a Post**

**Goal:** express reaction to content.

**Steps:**
1. User clicks “like”
2. Like relation is created
3. Like count is updated
    
### **💬 Comment on a Post**

**Goal:** interact with content.

**Steps:**
1. User writes a comment
2. Comment is saved
3. Comment is checked by moderation
4. Comment is shown or hidden
    
## **5️⃣ Social Connections (Friendship)**

### **🤝 Send Friend Request**

**Goal:** connect with another user.

**Steps:**
1. User sends friend request
2. Request status is set to “pending”
3. Target user receives notification
    
### **✅ Accept / Reject Request**
  
**Goal:** manage incoming requests.

**Steps:**
1. User views requests
2. Accepts or rejects
3. Relationship status is updated

## **6️⃣ Content Moderation (Minor Requirement)**

### **🛡 Automatic Moderation**

**Goal:** keep content safe.

**Steps:**
1. Post or comment is created
2. Content is automatically checked
3. Decision is made:
    - allow
    - warn
    - hide
    - delete
 
**Result:**
Only allowed content is visible.
