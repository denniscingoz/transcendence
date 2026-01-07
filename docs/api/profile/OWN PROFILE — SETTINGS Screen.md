  

This document describes user scenarios, API endpoints, DTOs, and error handling for the **Own Profile → Settings** screen.

## **1. Open Settings Screen**

**Trigger**: User clicks **Settings** button on Own Profile screen.

- Navigation only
    
- No API call

## **2. Load Current Settings**

### **Endpoint**

GET /profile/settings
### **Description**

Load current user settings (privacy, security flags, avatar info).
### **Success Response (200 OK)**

```
{
  "isSuccess": true,
  "data": {
    "isTwoFactorEnabled": false,
    "avatarUrl": "https://cdn.app/avatar.jpg"
  }
}
```

## **3. Change Profile Photo**

### **Endpoint**

PUT /profile/avatar

### **Request (multipart/form-data)**

- file: image (jpg/png)
    

### **Success Response (200 OK)**

```json
{
  "isSuccess": true,
  "errors": []
}
```

## **4. Activate 2-Factor Authentication**

### **Endpoint**

POST /profile/security/2fa/enable

### **Description**
  

Enables two-factor authentication for the account.
### **Success Response (200 OK)**

```
{
  "isSuccess": true,
  "errors": []
}
```

## **5. Disable 2-Factor Authentication**

### **Endpoint**

POST /profile/security/2fa/disable

### **Success Response (200 OK)**

```
{
  "isSuccess": true,
  "errors": []
}
```

## **6. Delete Account**

### **Endpoint**

DELETE /profile

### **Description**

Permanently deletes user account.
### **Success Response (200 OK)**

```
{
  "isSuccess": true,
  "errors": []
}
```

---

## **Error Handling (Standard)**

All error responses use **ApiResponseBase**.

### **401 Unauthorized**

```
{
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```

### **422 Validation Error**

```
{
  "isSuccess": false,
  "errors": ["Invalid request"]
}
```

---

## **Notes**

- All endpoints are **command-style** (no business data returned)
- data is returned only where explicitly required
- Settings screen follows the same API response rules as the rest of the system