# Mini SaaS Dashboard

A small full-stack SaaS dashboard for managing projects. You can **list**, **filter**,
**search**, **add** and **edit** projects, with JWT-based authentication.

Each project has a **status**, **deadline**, **assigned team member** and **budget**.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791) ![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4)

---

## Live demo

**https://minisaas.cabscloud.com**

Sign in with the seeded demo account:

| | |
| --- | --- |
| Email | `admin@example.com` |
| Password | `admin123` |

## Features

- **Responsive table view** of projects (name, status, assignee, deadline, budget).
- **Search** across project name, assignee and description (debounced).
- **Filter by status** (Active / On Hold / Completed) with quick chips.
- **Add / edit** projects through a **modal form** with inline validation.
- **Delete** projects with a confirmation prompt.
- **Summary cards** — total projects, active count, total budget.
- **Overdue highlighting** for past-deadline projects that aren't completed.
- **Authentication** — JWT stored in an httpOnly cookie, with route protection
  via Next.js middleware. Login, registration and logout included.
- **REST API** built with Next.js Route Handlers, validated with Zod.
- **PostgreSQL** via Prisma ORM, with a seed script for demo data.
- **Docker** support for the database (and optionally the full app).

## Tech stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | Next.js 14 (App Router) + TypeScript               |
| Styling   | Tailwind CSS                                        |
| Backend   | Next.js Route Handlers (REST)                       |
| Database  | PostgreSQL + Prisma ORM                             |
| Auth      | JWT (`jose`) in an httpOnly cookie + bcrypt hashing |
| Validation| Zod                                                 |

---

## Getting started

### Prerequisites

- Node.js 18.17+ (or 20+)
- A PostgreSQL database. The quickest option is Docker (below), or use a hosted
  one such as **Supabase** — just point `DATABASE_URL` at it.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env` if needed. At minimum set a real `JWT_SECRET`:

```bash
# generate a strong secret
openssl rand -base64 48
```

### 3. Start PostgreSQL (Docker)

```bash
docker compose up -d db
```

This starts Postgres on `localhost:5432`, matching the default `DATABASE_URL`.

> Prefer Supabase? Create a project, copy its connection string into
> `DATABASE_URL`, and skip this step.

### 4. Create the schema and seed data

```bash
npm run prisma:migrate   # creates tables (name the migration e.g. "init")
npm run db:seed          # seeds a demo user + 20 sample projects
```

### 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000 and sign in with the seeded demo account:

```
Email:    admin@example.com
Password: admin123
```

---

## Available scripts

| Script                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Start the dev server                           |
| `npm run build`         | Generate Prisma client + production build      |
| `npm run start`         | Run the production build                       |
| `npm run lint`          | Run ESLint                                     |
| `npm run prisma:migrate`| Create/apply a dev migration                   |
| `npm run prisma:deploy` | Apply migrations (production/CI)               |
| `npm run db:seed`       | Seed the database                              |
| `npm run db:reset`      | Drop, re-migrate and re-seed the database      |

---

## API reference

All `/api/projects` endpoints require authentication (a valid auth cookie).

### Auth

| Method | Endpoint             | Body                          | Description                    |
| ------ | -------------------- | ----------------------------- | ------------------------------ |
| POST   | `/api/auth/register` | `{ name, email, password }`   | Create an account + sign in    |
| POST   | `/api/auth/login`    | `{ email, password }`         | Sign in, sets auth cookie      |
| POST   | `/api/auth/logout`   | –                             | Clear the auth cookie          |
| GET    | `/api/auth/me`       | –                             | Current user                   |

### Projects

| Method | Endpoint             | Description                              |
| ------ | -------------------- | ---------------------------------------- |
| GET    | `/api/projects`      | List projects (supports query params)    |
| POST   | `/api/projects`      | Create a project                         |
| GET    | `/api/projects/:id`  | Fetch one project                        |
| PUT    | `/api/projects/:id`  | Update a project                         |
| DELETE | `/api/projects/:id`  | Delete a project                         |

**`GET /api/projects` query params**

| Param    | Values                                   | Description                            |
| -------- | ---------------------------------------- | -------------------------------------- |
| `status` | `ACTIVE` \| `ON_HOLD` \| `COMPLETED`     | Filter by status                       |
| `q`      | any string                               | Search name / assignee / description   |
| `sort`   | `deadline` \| `budget` \| `name` \| `createdAt` | Sort field (default `createdAt`) |
| `order`  | `asc` \| `desc`                          | Sort direction (default `desc`)        |

**Project shape**

```jsonc
{
  "id": "clx…",
  "name": "Website Redesign",
  "status": "ACTIVE",          // ACTIVE | ON_HOLD | COMPLETED
  "deadline": "2026-08-01T12:00:00.000Z",
  "assignedTo": "Ava Thompson",
  "budget": 42000,              // whole USD
  "description": "…",
  "createdAt": "…",
  "updatedAt": "…"
}
```

Example:

```bash
# after logging in through the UI (cookie is set), or with a saved cookie jar:
curl 'http://localhost:3000/api/projects?status=ACTIVE&q=web&sort=deadline&order=asc'
```

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/            # login, register, logout, me
│   │   └── projects/        # REST CRUD (+ /[id])
│   ├── dashboard/           # protected dashboard page
│   ├── login/ · register/   # auth pages
│   └── layout.tsx · page.tsx
├── components/              # Dashboard, table, modal, filters, auth form
├── lib/                     # prisma client, auth (JWT), validation (zod), helpers
├── types/                   # shared TS types
└── middleware.ts            # route protection
prisma/
├── schema.prisma            # User + Project models
└── seed.ts                  # demo user + sample projects
```

---

## Design notes

- **Why cookies + `jose`?** The JWT lives in an httpOnly cookie so it isn't
  readable from JavaScript (mitigates XSS token theft). `jose` verifies tokens in
  the Edge middleware, letting us protect routes before they render.
- **Validation lives server-side** with Zod (`src/lib/validation.ts`) and is the
  source of truth; the client mirrors the same status set for the UI.
- **Status is a Postgres enum**, so invalid values can't reach the database and
  filtering stays cheap (indexed).
- **Seeding is idempotent** — the demo user is upserted and projects are reset on
  each run, so `npm run db:seed` is safe to re-run.

## Deploying

- **Database:** any managed PostgreSQL works (Supabase, Neon, RDS, etc.). Set
  `DATABASE_URL` and run `npm run prisma:deploy`.
- **App:** deploy to any Node host or container platform. The Dockerfile produces
  a slim standalone image; uncomment the `app` service in `docker-compose.yml` to
  run the full stack locally. Set `JWT_SECRET` and `DATABASE_URL` in the
  environment.

## License

MIT — provided as an interview take-home task.
