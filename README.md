# FleetFlow

Fleet management system for tracking vehicles, drivers, trips, maintenance, fuel logs, and expenses.

Built with a **React** frontend (Vite + Tailwind CSS) and an **Express.js** backend (Prisma ORM + PostgreSQL).

### Live URLs

- **Frontend:** https://flow-fleet.vercel.app
- **Backend:** https://backend-fdcm.onrender.com

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup with Docker (Recommended)](#setup-with-docker-recommended)
- [Manual Setup](#manual-setup)
  - [1. Database](#1-database)
  - [2. Backend](#2-backend)
  - [3. Frontend](#3-frontend)
- [Default Ports](#default-ports)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [License](#license)

---

## Project Structure

```
Fleet_Flow/
  Backend/           # Express.js REST API
    prisma/          # Prisma schema and migrations
    src/
      modules/       # auth, vehicle (route/controller/service)
      middleware/     # JWT auth, role guard
      lib/           # Prisma client instance
  Frontend/          # React SPA (Vite + Tailwind CSS)
    src/
    public/
  docker-compose.yml # Full-stack Docker setup
```

---

## Prerequisites

**Docker setup:**

- Docker Engine 20+
- Docker Compose v2+

**Manual setup:**

- Node.js 20+
- npm 9+
- PostgreSQL 15+ (running and accessible)

---

## Environment Variables

### Backend (`Backend/.env`)

Create a `.env` file inside the `Backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

**Example with local PostgreSQL:**

```env
PORT=5000
DATABASE_URL=postgresql://fleetflow:fleetflow123@localhost:5432/fleetflow_db
JWT_SECRET=change-this-to-a-random-string
JWT_EXPIRES_IN=7d
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port. Defaults to `5000`. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens. |
| `JWT_EXPIRES_IN` | No | Token expiry duration. Defaults to `7d`. |

### Frontend (`Frontend/.env`)

Create a `.env` file inside the `Frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL including `/api` path. |

---

## Setup with Docker (Recommended)

This spins up PostgreSQL, the backend, and the frontend in one command.

**1. Clone the repository:**

```bash
git clone https://github.com/nick5369/Fleet_Flow.git
cd Fleet_Flow
```

**2. Start all services:**

```bash
docker compose up --build
```

This will:

- Start a PostgreSQL 16 database on port `5432`
- Build and start the backend on port `5000`
- Build and start the frontend on port `3000`
- Automatically run Prisma `db push` to sync the database schema

**3. Access the application:**

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

**4. Stop all services:**

```bash
docker compose down
```

To also remove the database volume (deletes all data):

```bash
docker compose down -v
```

---

## Manual Setup

### 1. Database

Install and start PostgreSQL, then create a database:

```bash
psql -U postgres
```

```sql
CREATE USER fleetflow WITH PASSWORD 'fleetflow123';
CREATE DATABASE fleetflow_db OWNER fleetflow;
\q
```

### 2. Backend

```bash
cd Backend
```

**Install dependencies:**

```bash
npm install
```

**Create the environment file:**

```bash
cp /dev/null .env
```

Add the following to `Backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://fleetflow:fleetflow123@localhost:5432/fleetflow_db
JWT_SECRET=change-this-to-a-random-string
JWT_EXPIRES_IN=7d
```

**Generate Prisma client and push schema to database:**

```bash
npx prisma generate
npx prisma db push
```

**Start the server:**

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000/api`.

### 3. Frontend

Open a new terminal:

```bash
cd Frontend
```

**Install dependencies:**

```bash
npm install
```

**Create the environment file:**

Add the following to `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Start the dev server:**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default).

**Build for production:**

```bash
npm run build
npm run preview
```

---

## Default Ports

| Service | Port | Notes |
|---|---|---|
| Frontend (dev) | `5173` | Vite dev server (manual setup) |
| Frontend (Docker) | `3000` | Nginx serving built assets |
| Backend | `5000` | Express.js API |
| PostgreSQL | `5432` | Database |

---

## API Overview

Base path: `/api`

All responses follow this format:

```json
{
  "success": true,
  "data": { },
  "message": "..."
}
```

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login, receive JWT token |
| `GET` | `/api/auth/me` | JWT | Get current user profile |

### Vehicle Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/vehicles` | JWT | List vehicles (paginated, filterable) |
| `GET` | `/api/vehicles/:id` | JWT | Get single vehicle |
| `POST` | `/api/vehicles` | JWT + MANAGER | Create a vehicle |
| `PATCH` | `/api/vehicles/:id` | JWT + MANAGER | Update a vehicle |

Authentication is done via the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## User Roles

| Role | Permissions |
|---|---|
| `MANAGER` | Full access. Can create and update vehicles. |
| `DISPATCHER` | Read access to vehicles. |
| `SAFETY_OFFICER` | Read access to vehicles. |
| `FINANCE_ANALYST` | Read access to vehicles. |

---
