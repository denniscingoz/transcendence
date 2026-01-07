## **1. Open login screen**

Navigation only - No API call

## **2. Login with username/email and password**
#### **Endpoint** POST /auth/login

### Request DTO
**Frontend (TypeScript, camelCase)**
```ts
export interface LoginRequest {
  identifier: string; // username or email
  password: string;
}```
**Backend (C#, PascalCase)**

```cs
public class LoginRequest
{
    public string Identifier { get; set; }
    public string Password { get; set; }
}
```
#### **Success Response (200 OK)**
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


## **3. Continue with Google (OAuth)**

###### **Endpoint** POST /auth/google

#### **Request DTO**
**Frontend (TypeScript, camelCase)**
```ts
export interface GoogleAuthRequest {
  idToken: string;
}
```
**Backend (C#, PascalCase)**

```cs
public class LoginRequest
{
    public string Identifier { get; set; }
    public string Password { get; set; }
}
```

Classic login:
Frontend → Identifier + Password
Backend → verifies credentials

Google OAuth:
Frontend → idToken
Backend → verifies Google + decides login OR signup
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
#### **401 Bad Unauthorized**
```json
{
  
  "isSuccess": false,
  "errors": ["Unauthorized"]
}
```
### **422 Unprocessable Entity**
```json
{
  
  "isSuccess": false,
  "errors": [
    "Identifier is required",
    "Password must not be empty"
  ]
}
```