# Planora Backend API

Backend application for **Planora - Smart Personal Schedule and Task Management System**.

## Tech Stack
- **Runtime**: Node.js + Express
- **Language**: TypeScript (Strict mode)
- **Database ORM**: Prisma ORM
- **Database**: MySQL

## Setup & Running
1. Install dependencies:
   ```bash
   npm install
   ```
2. Validate Prisma schema:
   ```bash
   npm run prisma:validate
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Build TypeScript:
   ```bash
   npm run build
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Endpoints
- `GET /api/health` - Check backend health status
