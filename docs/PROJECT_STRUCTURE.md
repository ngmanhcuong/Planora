# 📁 Planora - Project Structure Document

**Release Identifier**: Planora Core v1.0.0  

This document describes the directory organization and layer responsibilities across the Planora repository.

---

## 🌴 Repository Root Layout

```text
Planora/
├── BE/                    # Backend Node.js / Express / Prisma API service
├── FE/                    # Frontend React 18 / Vite / Tailwind SPA
├── docs/                  # Project documentation, guides, and presentation resources
├── docker-compose.yml     # Multi-stage production container orchestration
├── README.md              # Project overview and quickstart guide
└── .gitignore             # Root git ignore definitions
```

---

## ⚙️ Backend Structure (`BE/`)

```text
BE/
├── prisma/
│   ├── migrations/        # Sequential database migration SQL scripts
│   └── schema.prisma      # Prisma schema definition & models
├── src/
│   ├── config/            # Environment variable validation & database instance
│   ├── controllers/       # HTTP request handlers
│   ├── middlewares/       # Auth, error handling, helmet, & validation middlewares
│   ├── modules/           # Feature-based domain modules
│   │   ├── ai/            # AI context builder, free-slot engine, LLM provider
│   │   ├── auth/          # JWT auth controllers, services, schemas
│   │   ├── dashboard/     # Aggregated stats & overdue semantics
│   │   ├── events/        # Event CRUD & calendar aggregation
│   │   ├── habits/        # Habit streak calculation & check-in logging
│   │   ├── notifications/ # Notification dispatch & read operations
│   │   ├── profile/       # User profile management
│   │   ├── settings/      # User settings & preferences
│   │   ├── tasks/         # Task CRUD & priority calculations
│   │   └── timetables/    # Academic timetable slot management
│   ├── routes/            # Central Express API router registry
│   └── utils/             # Helper utilities (response formatters, logger)
├── tests/                 # Automated 45-point integration test suite
├── Dockerfile             # Multi-stage production Node.js build configuration
├── package.json           # Node dependencies & script shortcuts
└── tsconfig.json          # TypeScript compiler configuration
```

### Backend Layer Responsibilities
- **`src/modules/`**: Modular architecture bundling routes, controllers, services, and schemas per domain feature.
- **`src/middlewares/`**: Evaluates request authentication (`authenticateToken`), ownership access, and input Zod validation.
- **`src/modules/ai/`**: Decouples LLM prompt processing from free-slot math to guarantee conflict-free schedule generation.

---

## 🎨 Frontend Structure (`FE/`)

```text
FE/
├── public/                # Static public assets and web manifest
├── src/
│   ├── app/               # Core Application routes & provider wrappers
│   ├── components/        # Shared atomic UI components (Button, Modal, Card, Input)
│   ├── features/          # Domain-driven frontend feature modules
│   │   ├── ai/            # AI smart scheduling UI modals & recommendation view
│   │   ├── auth/          # Login, Register, & Auth guard components
│   │   ├── calendar/      # Weekly & Monthly calendar view components
│   │   ├── dashboard/     # Analytics widgets & summary cards
│   │   ├── habits/        # Habit tracking cards & streak visualizers
│   │   ├── notifications/ # Notification drawer & badge counter
│   │   ├── profile/       # Profile management form
│   │   ├── settings/      # Security & preference settings sections
│   │   ├── tasks/         # Task lists, filters, & task creation modal
│   │   └── timetable/     # Academic timetable weekly grid matrix
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Axios client instance, query client setup
│   ├── stores/            # Zustand global stores (authStore, uiStore)
│   └── types/             # Shared TypeScript interface definitions
├── Dockerfile             # Multi-stage production Nginx frontend container
├── nginx.conf             # Nginx SPA rewrite & reverse-proxy configuration
├── index.html             # Single-page HTML entrypoint
├── package.json           # Dependencies and Vite scripts
└── vite.config.ts         # Vite build configuration
```

### Frontend Layer Responsibilities
- **`src/features/`**: Contains domain-specific UI components, custom hooks, and API client calls grouped by feature.
- **`src/stores/`**: Manages volatile client state (e.g. current user session, active modal popups).
- **`src/lib/apiClient.ts`**: Provides a configured Axios instance with Bearer token headers and unified response interceptors.
