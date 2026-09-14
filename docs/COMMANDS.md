# 🛠️ Planora - Useful Command Cheat Sheet

**Release Identifier**: Planora Core v1.0.0  

This cheat sheet summarizes essential commands for local development, database management, testing, and Docker operations.

---

## ⚙️ Backend Commands (`BE/`)

```bash
# Navigate to Backend directory
cd BE

# Install dependencies deterministically
npm ci

# Start Express development server with hot-reload (ts-node-dev)
npm run dev

# Compile TypeScript code to dist/
npm run build

# Run production server from compiled dist/
npm run start

# Run the 45-point automated integration test suite
npm run test:integration

# Validate Prisma schema syntax
npx prisma validate

# Generate Prisma Client TypeScript types
npx prisma generate

# Apply pending database migrations in production
npx prisma migrate deploy

# Open Prisma Studio web GUI for database inspection
npx prisma studio
```

---

## 🎨 Frontend Commands (`FE/`)

```bash
# Navigate to Frontend directory
cd FE

# Install dependencies deterministically
npm ci

# Start Vite development server (HMR at http://localhost:5173)
npm run dev

# Build optimized production assets to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 🐳 Docker Compose Commands (Root Directory)

```bash
# Validate docker-compose.yml configuration syntax
docker compose config

# Build container images without using cache
docker compose build --no-cache

# Start full containerized stack in detached background mode
docker compose up -d

# Check status of running containers
docker compose ps

# View live backend container logs
docker compose logs -f backend

# Stop container stack (preserves MySQL database volume)
docker compose down

# Stop container stack and PURGE database volume (CAUTION: DELETES ALL DATA)
docker compose down -v
```
