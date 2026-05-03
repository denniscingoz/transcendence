# Transcendence

A small social platform built with a .NET backend and a React frontend. The project covers the core parts of a private social app: authentication, profiles, posts, comments, likes, friend requests, file uploads, notifications, and real-time chat.

The goal of this repository is to keep the backend and frontend close to the API contract.

## What is included

- Email/password authentication and Google sign-in
- JWT-protected API routes
- User profiles with editable account data and avatar support
- Feed, profile posts, comments, and likes
- Friend requests and friends list management
- File upload and protected file access
- Notifications and unread counters
- Real-time chat with SignalR
- PostgreSQL persistence with Entity Framework Core migrations
- Docker setup for the database, API, and Nginx reverse proxy
- React frontend with routing, API clients, hooks, i18n, and mock data support

## Tech stack

### Backend

- .NET / ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- SignalR
- JWT authentication
- Google authentication
- Swagger / OpenAPI

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- i18next
- MSW for mocked API responses
- Tailwind CSS

### Infrastructure

- Docker Compose
- Nginx
- Local development certificates
- Database backup and restore scripts

## Repository structure

```text
.
├── backend/
│   ├── Transcendence.Api/              # HTTP API, controllers, SignalR endpoints
│   ├── Transcendence.Application/      # Application layer and service contracts
│   ├── Transcendence.Domain/           # Domain entities and core models
│   ├── Transcendence.Infrastructure/   # EF Core, repositories, persistence, storage
│   └── Transcendence.sln
├── docker/
│   ├── nginx/                          # Nginx reverse proxy config and certificates
│   └── scripts/                        # env checks, cert generation, DB backup/restore
├── docs/                               # API notes, schemas, DB notes, scenarios
├── frontend/
│   ├── src/api/                        # Frontend API clients
│   ├── src/auth/                       # Auth context and protected routes
│   ├── src/components/                 # Shared UI components
│   ├── src/hooks/                      # Data-fetching and UI hooks
│   ├── src/pages/                      # App screens
│   ├── src/realtime/                   # SignalR client setup
│   └── src/i18n/                       # Translation files
├── uploads/                            # Local uploaded files, ignored in production use
├── docker-compose.yml
├── Makefile
└── .env.example
```

## Getting started

### Requirements

Install these before running the project locally:

- Docker and Docker Compose
- Node.js 18+
- npm
- .NET SDK

For the Docker-based flow, Docker is the main requirement. The frontend can also be run separately with Vite during development.

## Environment setup

Create the root environment file:

```bash
cp .env.example .env
```

Then update the values in `.env`:

```env
POSTGRES_DB=trans_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
JWT_KEY=change_me_to_a_long_random_secret_key
JWT_ISSUER=TranscendenceApi
JWT_AUDIENCE=TranscendenceFrontend
JWT_EXPIRY_MINUTES=60
GOOGLE_CLIENTID=your_google_client_id_here
```

For the frontend:

```bash
cd frontend
cp .env.example .env
```

Example frontend values:

```env
VITE_USE_MOCKS=false
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=/api
```

## Running with Docker

From the repository root:

```bash
make up
```

This will:

1. check that the root `.env` file exists;
2. generate local development certificates if needed;
3. build and start the database, API, and Nginx containers.

Useful commands:

```bash
make down        # stop containers
make build       # rebuild services
make clean       # stop and remove orphan containers
make fclean      # remove containers, volumes, certs, and uploads
make re          # clean and start again, keeping the DB volume
```

The API runs behind Nginx. The database uses PostgreSQL 16 and is exposed locally on port `5432`.

## Running the frontend locally

If you want to work on the frontend outside Docker:

```bash
cd frontend
npm install
npm run dev
```

Other frontend commands:

```bash
npm run build
npm run lint
npm run preview
```

## Database

Entity Framework migrations are stored in:

```text
backend/Transcendence.Infrastructure/Migrations
```

The API applies migrations on startup, so the database schema is updated automatically when the backend starts.

Database helper commands:

```bash
make backup-db
make restore-db
make db-up
make restore-up
```

Backups are stored in the `backups/` folder. Do not commit real database dumps or uploaded media.

## API documentation

Swagger is enabled in development mode. Once the API is running, open the Swagger UI from the API host.

The project also contains API notes and schema drafts in:

```text
docs/api/
docs/back end/
docs/db_schema/
```

These files are useful when checking endpoint payloads, pagination rules, auth responses, profile flows, feed behavior, and notification contracts.

## Main API areas

The backend currently exposes endpoints around:

- `auth` — sign up, sign in, sign out, Google sign-in
- `profile` — current user profile, other profiles, profile update, password change, user deletion, search
- `posts` — feed, profile posts, post details, comments, likes, create/delete post
- `friends` — friends list, friend requests, accept/decline, remove friend
- `files` — upload, read, avatar file access, delete
- `notifications` — list, unread count, mark as read
- `conversations` — chat conversations and messages
- `hubs/chat` — SignalR chat hub

## Frontend notes

The frontend is organized around pages, reusable hooks, and small API clients. Protected app routes are wrapped with `RequireAuth`, and real-time features are mounted through `RealtimeProvider`.

Main routes include:

- `/signin`
- `/feed`
- `/profile`
- `/profile/:userId`
- `/friends`
- `/chat`
- `/edit-profile`
- `/settings`
- `/post-create`
- `/terms-service`
- `/privacy-policy`

Mock data is available through MSW and can be enabled with:

```env
VITE_USE_MOCKS=true
```