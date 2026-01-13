
This document defines who owns pagination rules, how they are agreed between backend and frontend, and how they are applied across screens.

---

## 1. Ownership model

### Backend (Source of Truth)
Backend is responsible for:
- Default pageSize
- Maximum allowed pageSize
- Validation of pagination parameters
- Consistent behavior across all clients

Backend may:
- Clamp pageSize to max value
- Ignore invalid values and fallback to default
- Return validation error (422) for invalid pagination

---

### Frontend (UX-driven usage)
Frontend is responsible for:
- Choosing when to load next page (scroll, button)
- Using only allowed pageSize values
- Resetting pagination when query changes

Frontend does not:
- Invent new pageSize values
- Bypass backend limits

---

## 2. Agreed pagination defaults (v1)

| Screen | Default pageSize | Max pageSize | Notes |
|------|------------------|--------------|-------|
| Feed | 10 | 20 | Faster initial load |
| Search users | 20 | 50 | List-style UI |
| Post comments | 10 | 30 | Readable blocks |
| Post likes | 20 | 50 | Simple user list |

---

## 3. Query parameters contract

All paginated endpoints follow the same contract:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | integer | no | Page number (default: 1) |
| pageSize | integer | no | Items per page (default depends on endpoint) |

Backend behavior:
- page < 1 → treated as 1
- pageSize > max → clamped to max

---

## 4. Pagination + search behavior

When used with search:
- Pagination resets when search query (q) changes
- page is always reset to 1 on new query

Example:

**GET /search/users?q=dipp&page=1&pageSize=20**

---

## 5. Why pagination is fixed in the contract

Reasons:
- Predictable backend load
- Consistent UX across platforms
- Easier caching and optimization
- Clear responsibilities

---

## 6. Summary

- Backend defines pagination rules
- Frontend uses agreed values
- Rules are fixed in API contract
- All endpoints follow the same pagination shape