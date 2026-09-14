# 🌟 Planora - Smart Personal Schedule & Task Management System (v1.0.0)

**Release Identifier**: Planora Core v1.0.0  
**Phase**: Final Release Verification & Presentation Preparation  

Planora is a comprehensive personal productivity platform designed for students and professionals. It integrates task management, event calendar, academic timetables, habit tracking, push/in-app notifications, dashboard analytics, and AI-assisted scheduling.

---

## 📚 Project Documentation & Handover Links

Comprehensive system design, API references, presentation guides, and defense materials are documented in the [`docs/`](file:///d:/Planora/docs) directory:

- 🏛️ [**System Architecture**](file:///d:/Planora/docs/ARCHITECTURE.md): Multi-tier architecture overview, component diagram, and technology stack breakdown.
- 📁 [**Project Structure**](file:///d:/Planora/docs/PROJECT_STRUCTURE.md): Detailed directory layout and layer responsibilities for `BE/`, `FE/`, and root level files.
- 🗄️ [**Database Documentation**](file:///d:/Planora/docs/DATABASE.md): Complete Prisma data model reference and Mermaid Entity-Relationship Diagram (ERD).
- 🔌 [**API Documentation**](file:///d:/Planora/docs/API.md): Comprehensive REST API endpoint reference covering all 14 module route groups.
- 🌟 [**User Feature Guide**](file:///d:/Planora/docs/FEATURES.md): Functional user features and explicit advisory AI scheduling boundaries.
- 🔒 [**Security Architecture**](file:///d:/Planora/docs/SECURITY.md): JWT authentication, bcrypt encryption, multi-tenant isolation, and prompt injection defense.
- 🧠 [**AI Design Specification**](file:///d:/Planora/docs/AI_DESIGN.md): Hybrid deterministic free-slot engine and AI advisory workflow design.
- 📋 [**System Use Cases**](file:///d:/Planora/docs/USE_CASES.md): Formal software engineering use case specifications (UC01 – UC15).
- 🎬 [**Presentation & Demo Script**](file:///d:/Planora/docs/DEMO_SCRIPT.md): Step-by-step 7–10 minute live presentation demo script with natural Vietnamese dialogue.
- 🧪 [**Demo Data Preparation**](file:///d:/Planora/docs/DEMO_DATA.md): Safe manual data population guide for presentation environments.
- 📊 [**Presentation Slide Deck Outline**](file:///d:/Planora/docs/PRESENTATION_OUTLINE.md): 15-slide presentation deck structure, bullet points, and presenter scripts.
- 🎓 [**Lecturer Defense Q&A**](file:///d:/Planora/docs/DEFENSE_QA.md): 32 comprehensive lecturer defense questions and technical implementation answers.
- 📋 [**Pre-Demo Checklist**](file:///d:/Planora/docs/DEMO_CHECKLIST.md): T-30 minute pre-presentation environment check and offline AI fallback plan.
- 🛠️ [**Command Cheat Sheet**](file:///d:/Planora/docs/COMMANDS.md): Quick reference guide for backend, frontend, database, testing, and Docker commands.

---

## 🏗️ Architecture & Completed Phases

Planora backend and frontend have been fully developed, hardened, and verified across 14 systematic phases:

- **B3: Authentication & Security**: JWT authentication, bcrypt password hashing, input validation.
- **B4: Profile & Settings**: User profile management, theme selection, and notification preferences.
- **B5: Task Management**: Full CRUD, priority scoring, due date tracking, and overdue status semantics.
- **B6: Events & Calendar**: Event scheduling, date range filtering, timetable conflict checks.
- **B7: Timetable Management**: Weekly class schedules, subject cataloging, and active timetable toggle.
- **B8: Habit Tracking**: Daily habit streak calculation, logging check-ins, and target frequencies.
- **B9: Notifications System**: In-app notifications, unread count badge, mark as read operations.
- **B10: Dashboard Analytics**: Real-time statistics aggregation, completion rates, and consistent overdue metrics.
- **B11: Full Frontend-Backend Integration**: Complete Axios/Zustand integration replacing all frontend mock data.
- **B12: AI Smart Scheduling & Assistant**: Advisory AI prioritization, free slot schedule generation, atomic schedule application, and conversational assistant.
- **B13: Production Hardening & E2E Validation**: Zod environment startup validation, database readiness probes, helmet security headers, sanitized error responses, 45 automated integration tests, and multi-stage Docker containerization.
- **B14: Release Verification & Deployment Preparation**: Clean repository audit, secret & path sanitization, environment configuration validation, UTF-8 verification, and final deployment documentation.

---

## 🛠️ System Requirements & Tech Stack

### System Requirements
- **Node.js**: `Node.js 20 LTS` (v20.x recommended)
- **Database**: `MySQL 8.0` with `utf8mb4` charset support
- **Package Manager**: `npm` (v9.x or later)
- **Containerization**: `Docker 24.x+` & `Docker Compose v2.x+` (optional for local containerized deployment)

### Tech Stack
- **Backend (`BE/`)**: Node.js, Express, TypeScript, Prisma ORM, MySQL 8.0, Zod, Helmet, JWT, Bcrypt.js.
- **Frontend (`FE/`)**: React 18, TypeScript, Vite, TailwindCSS, Zustand, Lucide Icons, Axios.
- **Infrastructure & Proxy**: Docker, Docker Compose, Nginx (Frontend Reverse Proxy & Static Host).

---

## ⚙️ Environment Configuration

### Backend (`BE/.env`)
Copy `BE/.env.example` to `BE/.env` and update values accordingly:

```env
# Application Configuration
NODE_ENV=development # 'development' | 'production' | 'test'
PORT=5000
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Database Connection (MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/planora_db"

# JWT Secret Configuration
JWT_SECRET="planora_super_secret_production_jwt_key_2026"
JWT_EXPIRES_IN=7d

# AI Configuration (Optional: default is 'none')
AI_PROVIDER=none # 'none' | 'gemini' | 'openai'
AI_API_KEY=""
AI_MODEL=gemini-1.5-flash
```

#### Variable Reference:
- `NODE_ENV` *(Required)*: Application environment (`development` | `production` | `test`).
- `PORT` *(Required)*: Backend server listening port (default: `5000`).
- `DATABASE_URL` *(Required)*: MySQL connection string format `mysql://USER:PASSWORD@HOST:PORT/DATABASE`.
- `JWT_SECRET` *(Required)*: Cryptographic secret key used to sign JWT tokens.
- `JWT_EXPIRES_IN` *(Optional)*: Token validity duration (default: `7d`).
- `FRONTEND_URL` / `CLIENT_URL` *(Required)*: Origin URL of frontend for CORS security policies.
- `AI_PROVIDER` *(Optional)*: Set to `none` (default safe mode), `gemini`, or `openai`.
- `AI_API_KEY` *(Optional)*: API Key for AI services when `AI_PROVIDER` is enabled.
- `AI_MODEL` *(Optional)*: Specified LLM model name (default: `gemini-1.5-flash`).

### Frontend (`FE/.env`)
Copy `FE/.env.example` to `FE/.env`:

```env
# For local development against standalone backend:
VITE_API_URL=http://localhost:5000/api

# For Docker Nginx reverse-proxy deployment:
# VITE_API_URL=/api
```

---

## 🚀 Quick Start (Local Development Workflow)

### 1. Database Setup
Ensure MySQL 8.0 is running on `localhost:3306` with database `planora_db` created:

```sql
CREATE DATABASE IF NOT EXISTS planora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Installation & Migration
```bash
cd BE
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run dev
```
*Backend API will be running at `http://localhost:5000/api`.*  
*Health Check*: `http://localhost:5000/api/health`  
*Readiness Probe*: `http://localhost:5000/api/ready`

### 3. Frontend Installation & Startup
```bash
cd FE
npm ci
npm run build
npm run dev
```
*Frontend application will be accessible at `http://localhost:5173`.*

---

## 🗄️ Database Seeding & Migration Policy

- **Production Migration Command**: Always execute `npx prisma migrate deploy` in production environments. Do **NOT** use `npx prisma migrate dev` in production.
- **Database Seed Policy**: **No database seed is required for normal startup.** Default category entries (Work, Study, Personal, Health) are created dynamically upon user registration.

---

## 🧪 Automated Integration Testing

Planora includes a 45-point automated integration test suite covering authentication, multi-tenant isolation, CRUD operations across all modules, and AI error fallbacks:

```bash
cd BE
npm run test:integration
```

Expected Summary Output:
```text
📊 PLANORA TEST RESULTS SUMMARY
   Passed: 45
   Failed: 0
   Total:  45
```

---

## 🤖 AI Smart Scheduling Configuration

### Default Safe Configuration (`AI_PROVIDER=none`)
- If `AI_PROVIDER=none` or `AI_API_KEY` is omitted, the application runs in safe mode.
- `GET /api/ai/status` returns `{"enabled": false}`.
- AI smart scheduling endpoints return HTTP 503 Service Unavailable with clean fallback notifications.
- All core product modules (Auth, Tasks, Events, Timetables, Habits, Notifications, Dashboard) remain 100% operational.

### Enabling AI Capabilities
To enable Gemini/OpenAI smart scheduling:
1. Set `AI_PROVIDER=gemini` (or `openai`) in `BE/.env`.
2. Provide valid `AI_API_KEY` in `BE/.env`.
3. Restart the backend service (`npm run dev` or container restart).

---

## 🐳 Production Deployment with Docker Compose

Deploy the complete containerized stack (MySQL database, Express backend, Nginx frontend reverse-proxy) using Docker Compose:

### 1. Validate Docker Compose Configuration
```bash
docker compose config
```

### 2. Build Docker Images
```bash
docker compose build --no-cache
```

### 3. Start Containers in Background
```bash
docker compose up -d
```

### 4. Verify Container Status
```bash
docker compose ps
```

### 5. Container Endpoints
- **Frontend App (Nginx SPA & API Reverse Proxy)**: `http://localhost:80`
- **Direct Backend API**: `http://localhost:5000/api`
- **Backend Health Check**: `http://localhost:5000/api/health`
- **Database Readiness Probe**: `http://localhost:5000/api/ready`

### 6. Container Logs & Shutdown
```bash
# View backend logs
docker compose logs -f backend

# Gracefully stop stack (preserves database volume)
docker compose down

# Stop stack and PURGE database volume (CAUTION: DELETES ALL DATA)
docker compose down -v
```

---

## 🌐 Nginx Reverse Proxy & CORS Strategy

In Docker Compose deployment, the Nginx container serves the static React frontend SPA on port `80` and proxies all `/api/` HTTP requests directly to `http://backend:5000/api/`.

```nginx
location /api/ {
    proxy_pass http://backend:5000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

This single-origin design simplifies CORS requirements while `try_files` ensures React Router SPA client-side routes (`/dashboard`, `/tasks`, `/calendar`, `/timetable`, `/profile`, `/settings`) refresh seamlessly without 404 errors.

---

## 🛠️ Troubleshooting Guide

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| **Port 3306 already in use** | A local MySQL instance is already running on port 3306. | Stop the host MySQL service or change host port mapping in `docker-compose.yml` (e.g., `'3307:3306'`). |
| **Port 5000 or 80 in use** | Another service or application is occupying port 5000/80. | Stop the conflicting application or update port mapping in `BE/.env` / `docker-compose.yml`. |
| **Prisma cannot connect to DB** | MySQL is still starting up or credentials mismatch. | Verify `DATABASE_URL` credentials. Ensure MySQL container health check `mysqladmin ping` reports healthy. |
| **Frontend cannot reach backend** | Incorrect `VITE_API_URL` environment setting. | For local dev set `VITE_API_URL=http://localhost:5000/api`. For Docker set `VITE_API_URL=/api` before building FE. |
| **AI endpoint returns HTTP 503** | `AI_PROVIDER` is set to `none` or `AI_API_KEY` is missing. | This is expected default behavior. To enable AI, supply a valid `AI_API_KEY` and set `AI_PROVIDER=gemini`. |
| **SPA page refresh gives 404** | Web server missing SPA catch-all rewrite rule. | Ensure Nginx `try_files $uri $uri/ /index.html;` configuration is applied (included in `FE/nginx.conf`). |
| **Docker Volume Reset** | `docker compose down -v` was executed. | Running `down -v` deletes named volumes. Re-run `docker compose up -d` to re-initialize schema via Prisma entrypoint. |

---

## 🔒 Security & Reliability Features

- **Helmet Security Headers**: Applied globally across Express routes.
- **Production Error Sanitization**: Detailed error traces suppressed in production (`NODE_ENV=production`).
- **Multi-Tenant Data Isolation**: Database queries enforce user scoping (`where: { id, userId }`) across all business modules.
- **Atomic Transactions**: Multi-session AI schedule applications execute inside Prisma `$transaction` blocks.
- **UTF-8 Vietnamese Support**: Verified full support for Vietnamese Unicode characters (`utf8mb4`).
