# The SOCIAL — Frontend Doco

Date generated: 

It follows the “Social flow & technical tools” architecture:
UI → Frontend (React) → API Layer (ASP.NET) → Application/Domain → DB,
with **REST for CRUD** and **SignalR for realtime**. (See provided diagram.) 

## What this repo skeleton includes

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router (route layout + auth guard)
- AuthContext (JWT stored in localStorage for simplicity)
- Axios instance with JWT interceptor
- TanStack Query for REST caching/mutations
- SignalR connection utilities (chat + presence hubs)
- Pages: Signin, Profile, Friends, Chat (minimal but working patterns)
- i18n with EN/FR/ES and a language switcher

## How to run

1) Copy env file and set base URLs:
```bash
cp .env.example .env
```
Update:
- `VITE_API_BASE_URL` (your ASP.NET API base, e.g. https://localhost:5000)
- `VITE_SIGNALR_BASE_URL` (often same)

2) Install & run:
```bash
npm install
npm run dev
```

## Frontend “Rules” you should explain in evaluation

### 1) Why TanStack Query?
- It caches server state (friends list, profile, conversations)
- It avoids manual loading/error state repetition
- It provides invalidation and predictable re-fetching after mutations

### 2) REST vs SignalR
Use **REST** when:
- CRUD actions (get profile, list friends, add/remove friend)
- Loading screens (initial fetches, pagination)

Use **SignalR** when:
- Realtime chat messages
- Presence/online status
- Notifications / pushes

### 3) JWT handling (frontend)
- Signin gets token
- Token attached in Axios request interceptor
- 401 response → clear token and force user to re-signin

### 4) Stable pattern for realtime updates
- SignalR listener receives event
- Update React state via **TanStack Query cache**:
  `queryClient.setQueryData([...], updater)`
- Components re-render automatically

## Realtime owner

In `src/pages/ChatPage.tsx` you’ll see placeholder names:
- `MessageReceived`
- `SendMessage`

Then replace those names (the pattern stays the same).

## Backend features

Confirm exact endpoints:
- POST `/auth/signin`
- GET/PUT `/profile/me`
- POST `/profile/me/avatar`
- GET `/friends`
- POST `/friends` with { friendId }
- DELETE `/friends/{id}`
- (optional) REST chat endpoints if you load history that way


