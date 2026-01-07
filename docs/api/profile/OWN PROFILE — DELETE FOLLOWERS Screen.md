
This document describes user scenarios, API endpoints, DTOs, and error handling for the **Own Profile → Followers** screen.

## 1. Open Followers Screen

**Trigger**: User clicks **Followers** counter on Own Profile screen.

* Modal / overlay opens
* Initial followers list is loaded

## 2. Load Followers List

### Endpoint

`GET /profile/followers`

### Query Parameters

| Name     | Type    | Required | Description                           |
| -------- | ------- | -------- | ------------------------------------- |
| page     | integer | no       | Page number (default: 1)              |
| pageSize | integer | no       | Items per page (default: 20, max: 50) |
| q        | string  | no       | Search by username or name            |

### Success Response (200 OK)

```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "username": "dipp_sardar",
        "fullName": "Dippokash Sardar",
        "avatarUrl": "https://cdn.app/avatar.jpg"
      }
    ]
  },
  "metadata": {
    "totalCount": 120,
    "pageSize": 20,
    "currentPage": 1
  }
}
```

---

## 3. Search Followers

**Trigger**: User types in search input.

* Search is **debounced** (300–500 ms)
* Same endpoint as loading list
* Uses `q` query parameter

## 4. Remove Follower

### Endpoint

`DELETE /profile/followers/{userId}`

### Description

Removes a user from the current user’s followers.

### Path Parameters

| Name   | Type | Required | Description      |
| ------ | ---- | -------- | ---------------- |
| userId | uuid | yes      | Follower user ID |

### Success Response (200 OK)

```json
{
  "isSuccess": true,
  "errors": []
}
```

---

## Error Handling (Standard)

All error responses use **ApiResponseBase**.

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

---

## Notes

* Followers list is paginated
* Search and pagination use the same endpoint
* Removing a follower is a **command operation** and returns no data
* `data` is present only for list loading
