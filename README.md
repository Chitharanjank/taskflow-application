# TaskFlow – Full-stack microservices starter

TaskFlow is a small task management application with a browser UI, two Java/Spring Boot REST microservices, and two PostgreSQL databases.

## Architecture

- **Frontend:** React + Vite, served by Nginx on port `3000`.
- **Auth Service:** Java 21 + Spring Boot on port `8081`; registration, login, BCrypt password hashing, JWT generation.
- **Task Service:** Java 21 + Spring Boot on port `8082`; authenticated task CRUD and per-user task ownership.
- **auth-db / task-db:** separate PostgreSQL 16 databases.

The frontend is an application component, not a microservice. There are two Java microservices plus the frontend UI. Nginx serves the UI and reverse-proxies `/api/auth/*` and `/api/tasks*` to the backend containers, so browser requests use the same origin and no CORS configuration is needed.

## Run with Docker Compose

Requirements: Docker Engine/Desktop with the Compose plugin.

From the project root:

```bash
docker compose up --build -d
```

Open the browser:

```text
http://localhost:3000
```

Choose **Create account**, register with your name/email/password, then sign in. The JWT is stored and attached to API requests automatically by the frontend; users do not need to copy or paste it.

Useful commands:

```bash
docker compose ps
docker compose logs -f frontend auth-service task-service
docker compose down
```

To remove the containers AND development database data (this deletes registered users and tasks):

```bash
docker compose down -v
```

## Features

- Register and sign in from a normal browser form.
- Dashboard with total, to-do, in-progress and completed task counts.
- Create, edit and delete tasks.
- Change task status from the task list.
- Priority levels: LOW, MEDIUM, HIGH.
- Search tasks and filter by status.
- Tasks are scoped to the authenticated user by the Task Service.

## API routes

Auth Service:

- `POST /api/auth/register` – `{ "name": "Demo User", "email": "demo@example.com", "password": "Password123!" }`
- `POST /api/auth/login` – `{ "email": "demo@example.com", "password": "Password123!" }`

Task Service (requires `Authorization: Bearer <JWT>`):

- `GET /api/tasks`
- `POST /api/tasks` – `{ "title": "Deploy app", "description": "Deploy to test", "priority": "HIGH", "status": "TODO" }`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

## Ports

| Component | Host port |
|---|---:|
| TaskFlow UI (Nginx) | 3000 |
| Auth Service | 8081 |
| Task Service | 8082 |
| Auth PostgreSQL | 5433 |
| Task PostgreSQL | 5434 |

## Important development notes

- This is a learning/demo starter. The Compose credentials and JWT secret are development values; replace them with strong secrets before any shared or production deployment.
- For production, prefer short-lived access tokens and secure HttpOnly, SameSite cookies (or another carefully designed token-storage approach), HTTPS, rate limiting, audit logging, input validation, and managed secrets.
- The UI currently uses browser localStorage for the JWT to keep this starter straightforward. Do not treat that as the ideal production security design.
- The frontend uses the API response shape from the included Auth Service (`{ token, tokenType, user }`) and the Task Service task fields (`id`, `title`, `description`, `priority`, `status`).

## Project structure

```text
.
├── auth-service/       # Java/Spring Boot authentication service
├── task-service/       # Java/Spring Boot task service
├── frontend/           # React UI + Nginx reverse proxy
└── docker-compose.yml  # frontend, 2 services, 2 PostgreSQL databases
```
