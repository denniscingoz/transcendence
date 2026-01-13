## Purpose

Display a public profile of another user. The screen adapts based on whether the current user follows this profile.

Authentication: **Required**

---

## User Scenarios

### 1. Open other user profile

* User opens profile from:

  * Feed
  * Followers / Following list
  * Search results
* Backend loads public profile data
* UI renders profile in one of two states:

  * **Not followed**
  * **Followed**

---

### 2. View profile (Not Followed state)

* Profile header shows:

  * Avatar
  * Display name
  * Username
  * Bio
  * Counters: posts / followers / following
* Action buttons:

  * **Follow**
  * **Message**

---

### 3. View profile (Followed state)

* Same profile data
* Action buttons:

  * **Followed** (toggle)
  * **Message**

---

### 4. Follow user

**Endpoint:** `POST /profile/{userId}/follow`

* User clicks **Follow**
* Backend creates follow relation
* UI updates button state to **Followed**
* Followers counter increments

---

### 5. Unfollow user

**Endpoint:** `DELETE /profile/{userId}/follow`

* User clicks **Followed**
* Backend removes follow relation
* UI updates button state to **Follow**
* Followers counter decrements

---

### 6. Open chat

* User clicks **Message**
* Redirect to Chats screen
* Existing dialog opens **or** new dialog is created

---

## API

### Get other user profile

**Endpoint:** `GET /profile/{userId}`

**Response:** `200 OK`

```json
{
  "isSuccess": true,
  "errors": [],
  "data": {
    "id": "uuid",
    "username": "string",
    "displayName": "string",
    "avatarUrl": "string",
    "bio": "string",
    "postsCount": 100,
    "followersCount": 720,
    "followingCount": 1200,
    "isFollowedByMe": true
  }
}
```

---

### Follow user

**Endpoint:** `POST /profile/{userId}/follow`

**Response:** `200 OK`

```json
{
  "isSuccess": true,
  "errors": []
}
```

---

### Unfollow user

**Endpoint:** `DELETE /profile/{userId}/follow`

**Response:** `200 OK`

```json
{
  "isSuccess": true,
  "errors": []
}
```

---

## Response DTOs (Backend)

```json
OtherProfileDto
{
  "id": "uuid",
  "username": "string",
  "displayName": "string",
  "avatarUrl": "string",
  "bio": "string",
  "postsCount": "number",
  "followersCount": "number",
  "followingCount": "number",
  "isFollowedByMe": "boolean"
}
```

---

## Errors

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
  "errors": ["User not found"]
}
```
	