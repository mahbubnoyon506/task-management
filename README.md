# TaskFlow — Task Management System

A production-ready Task Management System with Role-Based Access Control and Audit Logging, built with **NestJS** + **Next.js** + **PostgreSQL (Prisma)**.

---

## Demo Credentials

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@taskapp.com    | admin123  |
| User  | user@taskapp.com     | user123   |
| User  | jane@taskapp.com     | user123   |

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | Next.js 14 (App Router), TailwindCSS, Shadcn UI    |
| State     | TanStack Query v5, Zustand, React Hook Form + Zod  |
| Backend   | NestJS 10 (Modular), Passport JWT                  |
| Database  | PostgreSQL via Neon (cloud), Prisma ORM             |
| Theming   | next-themes (persistent light/dark mode)            |

---

## Running Locally (Recommended)

### Prerequisites
- Node.js 18+ and npm
- Git

### Step 1 — Clone / Extract the project

```bash
# If you have the zip:
unzip task-management.zip
cd task-management

# Or if cloned from GitHub:
git clone <repo-url>
cd task-management
```

### Step 2 — Backend setup

```bash
cd backend

# Install dependencies
npm install

# The .env is already configured with the Neon DB URL.
# If you want to use your own DB, edit backend/.env:
# DATABASE_URL="your-postgresql-url"

# Push schema to database and seed demo users + tasks
npm run db:setup

# Start the backend dev server (runs on http://localhost:4000)
npm run start:dev
```

### Step 3 — Frontend setup (new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend dev server (runs on http://localhost:3000)
npm run dev
```

### Step 4 — Open the app

Visit **http://localhost:3000** and log in with the demo credentials above.

---

## Running with Docker

### Prerequisites
- Docker and Docker Compose installed

### One command startup

```bash
# From the project root (where docker-compose.yml lives)
docker compose up --build
```

This will:
1. Build the NestJS backend image
2. Build the Next.js frontend image
3. Run Prisma migrations on startup
4. Seed the database with demo users and tasks

Visit **http://localhost:3000** once both containers are healthy.

### Stop and clean up

```bash
docker compose down
```

---

## Project Structure

```
task-management/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # JWT strategy, login endpoint
│   │   ├── tasks/              # CRUD + status endpoints
│   │   ├── users/              # User listing (admin only)
│   │   ├── audit/              # Audit log service + endpoint
│   │   ├── prisma/             # Global PrismaService
│   │   └── common/
│   │       ├── decorators/     # @Roles(), @CurrentUser(), @AuditAction()
│   │       ├── guards/         # JwtAuthGuard, RolesGuard
│   │       └── interceptors/   # AuditLogInterceptor (global)
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema (users, tasks, audit_logs)
│   │   └── seed.ts             # Demo data seeder
│   └── .env                    # DB URL + JWT secret
│
├── frontend/                   # Next.js 14 App Router
│   └── src/
│       ├── app/
│       │   ├── (auth)/login/   # Login page
│       │   └── (dashboard)/    # Protected layout + pages
│       │       ├── admin/      # Task table, Audit logs, Users
│       │       └── dashboard/  # User's assigned tasks
│       ├── components/
│       │   ├── tasks/          # TaskTable, TaskForm, StatusDropdown
│       │   ├── audit/          # AuditLogTable, AuditDiffViewer
│       │   └── ui/             # Shadcn components + Sidebar
│       ├── hooks/              # TanStack Query hooks
│       ├── store/              # Zustand auth store
│       └── lib/                # Axios instance, utilities
│
└── docker-compose.yml
```

---

## API Endpoints

| Method | Endpoint                  | Auth      | Description              |
|--------|---------------------------|-----------|--------------------------|
| POST   | /api/auth/login           | Public    | Login, returns JWT       |
| GET    | /api/auth/me              | Any       | Current user profile     |
| GET    | /api/tasks                | Any       | All tasks (admin) / assigned (user) |
| POST   | /api/tasks                | Admin     | Create task              |
| PATCH  | /api/tasks/:id            | Admin     | Update task              |
| PATCH  | /api/tasks/:id/status     | Any       | Update status (own task) |
| DELETE | /api/tasks/:id            | Admin     | Delete task              |
| GET    | /api/users                | Admin     | List all users           |
| GET    | /api/audit-logs           | Admin     | Paginated audit log      |

---

## Audit Log Architecture

All task mutations are logged **automatically** via a global NestJS interceptor. No audit code exists in business logic.

```
Request → JwtAuthGuard → RolesGuard → AuditLogInterceptor → Controller → Service
                                              ↓
                              Captures "before" snapshot from DB
                              Lets handler run
                              Captures "after" from response body
                              Writes to audit_logs table via AuditService
```

Each log entry stores:
- **actor** — who performed the action
- **actionType** — `TASK_CREATED | TASK_UPDATED | TASK_DELETED | TASK_STATUS_CHANGED | TASK_ASSIGNED`
- **beforeSnapshot** — full task JSON before the change (null for creation)
- **afterSnapshot** — full task JSON after the change (null for deletion)

The Admin **Audit Log** page displays a diff viewer that shows exactly which fields changed between the before and after snapshots.

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://..."   # PostgreSQL connection string
JWT_SECRET="your-secret-key"      # JWT signing secret
PORT=4000                         # Server port
FRONTEND_URL="http://localhost:3000"  # CORS origin
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
