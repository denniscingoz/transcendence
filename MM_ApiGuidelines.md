# 📜 API & Real-Time Collaboration Guidelines

## 1. Naming Convention
*   **Backend (C#):** PascalCase for properties.
*   **Frontend (TS):** camelCase for properties.
*   **Bridge:** The API must be configured to serialize JSON as **camelCase** (Standard for Web APIs).

## 2. Real-Time Events (SignalR)
To avoid confusion and ensure strict event handling, we will use the following standard event names:
*   `OnNotificationReceived` -> Pushes a `NotificationDto` object.
*   `OnFileStatusChanged` -> Pushes a `FileMetadataDto` object (useful for progress/completion).
*   `OnPermissionsUpdated` -> Signals the frontend to re-fetch the user's permission set.

## 3. Date Handling
All dates must be sent and received in **UTC ISO 8601** format to avoid timezone bugs:
$$ YYYY-MM-DDTHH:mm:ssZ $$

## 4. Error Handling & Status Codes
The frontend expects the following standard HTTP responses:
*   **200 OK / 201 Created:** Success.
*   **400 Bad Request:** General client-side error.
*   **401 Unauthorized:** Token is expired, invalid, or missing.
*   **403 Forbidden:** User is authenticated but lacks the specific `UserPermission` for this resource.
*   **422 Unprocessable Entity:** Validation errors (e.g., "Email already exists"). Details must be in the `errors` array.

## 5. Standard Response Envelope
Every API response must follow this structure to ensure the Frontend can parse it safely:

{
  "data": {},        // The requested object or array
  "isSuccess": true, // Boolean flag
  "message": "",     // Optional human-readable message
  "errors": [],      // Array of strings explaining failures
  "metadata": {      // Required for paginated lists
    "totalCount": 0,
    "pageSize": 10,
    "currentPage": 1
  }
}

/**
 * CORE SOCIAL NETWORK TYPES - FRONTEND
 */

// --- Notifications ---
export type NotificationSeverity = 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationSeverity;
  message: string;
  timestamp: string; // ISO 8601 Format
  isRead: boolean;
}

// --- Permissions (CASL Compatible) ---
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Subject = 'Post' | 'Comment' | 'File' | 'User' | 'Notification';

export interface UserPermission {
  action: Action;
  subject: Subject;
  conditions?: Record<string, any>; // e.g., { "ownerId": "123" }
}

// --- File Management ---
export type FileStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  status: FileStatus;
  ownerId: string;
}

// --- Standard API Response Envelope ---
export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message?: string;
  errors: string[];
  metadata?: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
  };
}
