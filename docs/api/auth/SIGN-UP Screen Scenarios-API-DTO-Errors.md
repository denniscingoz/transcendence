## **1. Open signup screen**

Navigation only - No API call

## **2. Sign up with   email and password**
#### **Endpoint** POST /auth/signup

### Request DTO
**Frontend (TypeScript, camelCase)**
```ts
export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  uername: string;
}```
**Backend (C#, PascalCase)**

```cs
public class SignupRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
    public string Username { get; set; }
}
```
#### **Success Response (201 Created)**
```json
{
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresAt": "2026-01-04T12:30:00Z",
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@mail.com"
    }
  },
  "isSuccess": true,
  "message": "Signup successful",
  "errors": []
}
```


## **3. Continue with Google (OAuth)**

###### **Endpoint** POST /auth/google (same)

#### **Request DTO**
**Frontend (TypeScript, camelCase)**
```ts
export interface GoogleAuthRequest {
  idToken: string;
}
```
**Backend (C#, PascalCase)**

```cs
public class GoogleAuthRequest
{
    public string IdToken { get; set; }
}
```

#### **Success Response (200 OK | 201 Created)**
```json
{
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresAt": "2026-01-04T12:30:00Z",
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@mail.com"
    }
  },
  "isSuccess": true,
  "message": "Login successful",
  "errors": []
}
```



## **4. Navigate to signup screen**

Navigation only - No API call


## Response DTOs (Backend)
```
public class AuthResponseDto
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public DateTime ExpiresAt { get; set; } // UTC ISO 8601
    public UserShortDto User { get; set; }
}

public class UserShortDto
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
}
```

## **Error Handling (Standard)**

All error responses follow the standard API envelope.
#### **400 Bad Request**
```json
{
  
  "isSuccess": false,
  "errors": ["Invalid request payload"]
}
```
#### **409 Conflict**
```json
{
  
  "isSuccess": false,
  "errors": ["Email allready exists"]
}
```
### **422 Unprocessable Entity**
```json
{
  
  "isSuccess": false,
  "errors": [
    "Email is required",
    "Password must be at least 8 characters",
    "Username is required"
  ]
}
```