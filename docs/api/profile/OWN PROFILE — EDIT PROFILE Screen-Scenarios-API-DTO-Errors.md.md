
## 1. Open Edit Profile screen

### Scenario

User clicks **Edit profile** button on **Own Profile** screen.

### Behavior

- Edit Profile opens as a **separate modal / screen**
    
- Background profile screen is dimmed or blocked
    
- All fields are prefilled with current values
    

### Navigation

- No URL change required (modal) OR
    
- Optional route: `/profile/edit`

## 2. Prefill editable fields

### Editable fields

- Avatar
    
- Full name
    
- Username
    
- Bio
    
### Data source

Profile data is already loaded from **Own Profile screen state**.

📌 **No additional API call is required here** if profile data is cached.

(Optional fallback) `GET /profile/me`

## 3. Update profile text fields

### Scenario

User edits **name / username / bio** and clicks **Save**.

### Endpoint

`PUT /profile/me`
### Request DTO
```json
{
	"fullName": "Dipprokash Sardar",
	"username": "dipp_sardar",
	"bio": "Welcome to my profile!"
}
```
### Validation rules

- `fullName`: max 50 characters
    
- `username`: 3–30 characters, unique
    
- `bio`: max 150 characters
    
### Success Response (200 OK)
```json
{
"isSuccess": true
}
```
## 4. Change profile photo

### Scenario

User clicks **Change Photo** button.

### Behavior

- File picker opens
    
- User selects image
    
- Upload starts after confirmation
    

### Endpoint

`PUT /profile/me/avatar`

### Request

`multipart/form-data`

|Field|Type|Required|
|---|---|---|
|file|image|yes|
### Success Response
```json
{
"isSuccess": true
}
```
## 5. Cancel editing

### Scenario

User clicks **Close / Cancel** button.

### Behavior

- Edit Profile screen closes
    
- No API calls are made
    
- All changes are discarded
    

---

## 6. Error Handling

### 400 Validation Error
```json
{
  
  "isSuccess": false,
  "errors": [""]
}
```
 
### 401 Unauthorized

```json
{
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```
---

## 7. Notes

- Edit Profile is a **pure edit-only screen**
    
- No counters, no posts, no followers logic
    
- Avatar upload is isolated from text updates
    

---

## 8. Summary

- Edit Profile is independent from Own Profile view
    
- Uses minimal API surface
    
- Changes applied only on explicit save