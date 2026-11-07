# TaskFlow – Java Microservices Task Tracker

A starter Jira-like task management backend with two Spring Boot microservices.

## Services
- `auth-service` (8081): registration, login, JWT issuance, current user
- `task-service` (8082): authenticated task CRUD, task status and priority

Each service has its own PostgreSQL database. Task Service validates JWTs using the same `JWT_SECRET` as Auth Service.

## Requirements
- Java 21
- Maven 3.9+
- Docker + Docker Compose

## Run with Docker Compose
```bash
docker compose up --build
```

## Run locally
Start PostgreSQL databases first (or use Docker Compose and comment out the two application services).
```bash
cd auth-service && mvn spring-boot:run
cd task-service && mvn spring-boot:run
```

## API quick start

Register:
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"Password123!"}'
```

Login:
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Password123!"}'
```
Copy the `token` from the response.

Create a task:
```bash
curl -X POST http://localhost:8082/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy TaskFlow to EKS","description":"Build CI/CD pipeline","priority":"HIGH","status":"TODO"}'
```

List your tasks:
```bash
curl http://localhost:8082/api/tasks -H "Authorization: Bearer YOUR_TOKEN"
```

## Main endpoints

### Auth Service
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login and receive JWT |

### Task Service
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List tasks owned by current user |
| GET | `/api/tasks/{id}` | Get one task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

Task status: `TODO`, `IN_PROGRESS`, `DONE`  
Priority: `LOW`, `MEDIUM`, `HIGH`

## Environment variables
- `JWT_SECRET`: shared secret, at least 32 characters
- `AUTH_DB_URL`, `AUTH_DB_USER`, `AUTH_DB_PASSWORD`
- `TASK_DB_URL`, `TASK_DB_USER`, `TASK_DB_PASSWORD`

**Security note:** This is a learning starter, not production-hardened. Replace the development JWT secret, use HTTPS, add migrations (Flyway), validation/rate limiting, refresh-token rotation, centralized secrets, tests, and stricter CORS before production.
