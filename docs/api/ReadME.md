# **📘 API & Screen Documentation Overview**

  

This folder contains **screen-based API documentation and OpenAPI contracts** designed to align frontend and backend development and allow the team to work **in parallel**.

---

## **1. Screen-based Markdown files (** .md)

Each screen (Feed, Own Profile, Other Profile, Post Open, Chats, etc.) is documented in a separate Markdown file.

These files describe:

- **User scenarios** (what the user does on the screen)
    
- **Which API endpoints are called**
    
- **Request and Response DTOs**
    
- **Standard error cases** (401, 403, 404, 422, etc.)


**Purpose**:

- Bridge between **Figma designs** and **API implementation**
    
- Make screen behavior explicit and unambiguous
    
- Reduce back-and-forth between frontend and backend
    

These files answer the question:

> _“What should happen on this screen and which API calls are involved?”_

---

## **2. openapi.yaml — API contract**

openapi.yaml is the **single source of truth** for all HTTP APIs.

It defines:

- All API paths and HTTP methods
    
- Query parameters and request bodies
    
- Response schemas
    
- References to DTO definitions

**Purpose**:

- Used by Swagger / OpenAPI tools
    
- Allows frontend to mock API responses
    
- Allows backend to implement against a fixed contract

This file answers:

> _“What API endpoints exist and what do they return?”_

---

## **3. Schemas folders — DTO definitions**


Each feature module has its own schema files, for example:

- feed/*.schemas.yaml
    
- profile/*.schemas.yaml
    
- search/*.schemas.yaml

These files contain **pure DTOs**:

- No business logic
    
- Only JSON structures exchanged between frontend and backend
    
- Optimized for UI needs, not domain models
    

---

## **4. Common API response envelope**

All API responses follow a **unified base response format**, defined in:

```
common/ApiResponse.yaml
```

Base structure:

```
{
  "isSuccess": true,
  "errors": [],
  "message": "...",
  "metadata": { ... }
}
```

**Important notes**:

- If an endpoint does not return data, **no** **data: null** **is sent**
    
- Success responses may consist only of the base envelope
  

This ensures:

- Predictable error handling
    
- Consistent frontend logic
    
- Simple API consumption

---

## **5. Shared User DTO**

UserShortDto is reused across the entire API (posts, comments, likes, chats).

It contains only safe, minimal user information:

```
{
  "id": "uuid",
  "username": "john_doe",
  "avatarUrl": "..."
}
```

This avoids duplication and  prevents accidental exposure of sensitive user information across public API endpoints.

---

## **6. About feature-specific envelopes**

  
Some folders contain feature-specific envelopes (e.g. FeedResponseEnvelope, ProfileUpdatedEnvelope).


These envelopes:

- Exist mainly to **bind DTOs to endpoints in OpenAPI**
    
- Help Swagger resolve response schemas correctly
    
- May look redundant but keep the API contract explicit

> ⚠️ They are **not business-layer concepts**.

> Think of them as **documentation glue**, not core architecture.


If needed, they can be simplified or flattened later **without changing screen behavior**.

---

## **7. How everything fits together**

```
Figma → Screen Scenarios (MD) → DTOs → OpenAPI → Backend & Frontend
```

- Markdown files explain **why**
    
- OpenAPI defines **what**
    
- DTOs define **how data looks**
    
- Backend and frontend implement against the same contract
    

---

## **Goal of this setup**

- Enable **parallel development**
    
- Reduce misunderstandings
    
- Make API behavior explicit
    
- Provide a stable foundation for future changes
    
