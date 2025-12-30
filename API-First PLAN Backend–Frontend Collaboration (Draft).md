## **High-level approach**

**Before starting implementation, we will first align on the product foundation based on user scenarios and agreed technical rules.**

This includes:

- core user journeys (what users can and cannot do),
- MVP screen functionality (high-level, without UI details),
- API interaction rules (naming, error handling, response envelope),
- authorization and permission boundaries.
    
Once this foundation is agreed upon, I will follow an **API-first, contract-driven approach** with **iterative backend implementation**.

The goal is to:
- unblock frontend development as early as possible,
- avoid rework and misaligned expectations,
- keep Swagger/OpenAPI as the **single source of truth**.

## **Phase A — API Contract Skeleton (Frontend Unblock)**

**Timeline:** 2–3 days

**Goal:** Allow frontend to work independently using generated types and mocks.
### **1. User Scenarios (High-level)**

We define only **core user journeys**, not edge cases:

- Authentication

	- Register
    - Login
    - Refresh token
    - Logout
    
- Content
 
    - View post list
    - View post details
    - Create / edit / delete post

- Social
    
    - View comments
    - Add comment
    
- System
    
    - Fetch notifications
    - Mark notifications as read
    - Fetch current user permissions

###  **2. DTOs (Screen-oriented, not DB-oriented)**

DTOs are designed **from the UI perspective**, not from database entities.

Examples:

- PostListItemDto (for feed)
- PostDetailsDto (for post page)
- UserPublicDto
- AuthResponseDto
- NotificationDto
- UserPermissionDto

> DTOs remain **endpoint-specific**.
  We do **not** create a universal DTO!


---
### **3. Standard API Rules (Frozen Early)**

These rules are fixed before implementation:

- JSON serialization: **camelCase**
- Dates: **UTC ISO 8601**
- Error handling:
    - 401 — Unauthorized
    - 403 — Forbidden (permission missing)
    - 422 — Validation errors
        
- Standard response envelope:
{
  "data": {},
  "isSuccess": true,
  "message": "",
  "errors": [],
  "metadata": {}
}

### **4. Swagger / OpenAPI (Skeleton)**

Swagger contains:

- endpoints
- request / response DTOs
- status codes
- example responses
    
Business logic is **not required yet**.

**Result:**
Frontend can:
- generate TypeScript types
- mock API responses
- build UI and state management
- work without waiting for backend implementation

---

**We will start by defining an initial authentication contract in Swagger**
**to establish common rules and unblock frontend work.**

**Based on this contract, the frontend can proceed independently,**
**while backend implementation will follow feature by feature.**

**Swagger will serve as a shared reference point**
**and will be kept in sync as the implementation evolves.**

---

## **Phase B — Backend Implementation (Vertical Slices)**

**Goal:** Deliver working features incrementally while keeping Swagger in sync.

implement backend **by feature slices**, not by layers.

### **Example: Auth Slice**

- Controller / endpoint
- DTOs
- Validation
- Errors (401 / 422)
- Swagger matches reality
    
Then move to:

- Posts
- Comments
- Notifications
- Permissions

Each slice is:

- independently testable
- production-ready
- aligned with the API contract
    
## **Why not “everything upfront”?**

### **❌ Full upfront design**

- Slow
- High risk of change
- Swagger becomes outdated
    
### **❌ One-by-one without contract**

- Frontend blocked
- Constant coordination
- Unstable types
    
### **✅ Skeleton contract + iterations (chosen)**

- Frontend unblocked
- Backend flexible
- Clear ownership
- Minimal rework
    
## **Key Principle**

> **DTOs are defined by UI needs, not database structure.**

> Database entities may change.

> API contracts should be stable.

## **Short team-ready summary**

> We will freeze an API skeleton first (Swagger + DTOs + error format) so frontend can start immediately.
> Backend implementation will follow in vertical feature slices, keeping Swagger as the source of truth.