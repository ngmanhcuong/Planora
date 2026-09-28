# Planora - Smart Personal Schedule & Task Management System

**Version:** 1.0.0  
**Release:** Planora Core v1.0.0  
**Status:** Final Release

Planora là hệ thống quản lý lịch trình và công việc cá nhân, tập trung vào sinh viên và người dùng muốn quản lý thời gian hằng ngày hiệu quả hơn.

Hệ thống hỗ trợ:

- Quản lý công việc (Tasks)
- Sự kiện và lịch (Events & Calendar)
- Thời khóa biểu (Timetable)
- Theo dõi thói quen (Habits)
- Thông báo (Notifications)
- Dashboard thống kê
- AI Smart Scheduling

AI được sử dụng để phân tích công việc, tìm khoảng thời gian trống và đề xuất lịch phù hợp. Đây là tính năng hỗ trợ, vì vậy các chức năng chính của Planora vẫn hoạt động khi AI chưa được cấu hình.

---

## Project Documentation

Tài liệu chi tiết được lưu trong thư mục `docs/`:

| Document | Description |
|---|---|
| `ARCHITECTURE.md` | Kiến trúc tổng thể và công nghệ |
| `PROJECT_STRUCTURE.md` | Cấu trúc thư mục project |
| `DATABASE.md` | Database model và ERD |
| `API.md` | REST API documentation |
| `FEATURES.md` | Các chức năng của hệ thống |
| `SECURITY.md` | Authentication và Security |
| `AI_DESIGN.md` | Thiết kế AI Scheduling |
| `USE_CASES.md` | Use Case UC01–UC15 |
| `DEMO_SCRIPT.md` | Kịch bản demo |
| `DEMO_DATA.md` | Chuẩn bị dữ liệu demo |
| `PRESENTATION_OUTLINE.md` | Nội dung slide thuyết trình |
| `DEFENSE_QA.md` | Câu hỏi chuẩn bị bảo vệ |
| `DEMO_CHECKLIST.md` | Checklist trước demo |
| `COMMANDS.md` | Các command thường dùng |

---

# Main Features

## Authentication & Security

- JWT Authentication
- Hash password bằng bcrypt
- Validate input bằng Zod
- Protected API routes
- User Data Isolation
- Helmet security headers

## Task Management

- CRUD Task
- Priority và Due Date
- Overdue detection
- Priority Score

## Events & Calendar

- CRUD Event
- Lọc sự kiện theo thời gian
- Calendar integration
- Kiểm tra trùng lịch

## Timetable

- Quản lý thời khóa biểu
- Quản lý môn học
- Bật/tắt timetable
- Kiểm tra xung đột thời gian

## Habit Tracking

- CRUD Habit
- Daily Check-in
- Streak Tracking
- Target Frequency

## Notifications

- In-app Notifications
- Unread Count
- Mark as Read
- Quản lý trạng thái thông báo

## Dashboard

- Task Statistics
- Completion Rate
- Overdue Tasks
- Tổng hợp dữ liệu từ các module

## AI Smart Scheduling

- Phân tích độ ưu tiên của Task
- Tìm Free Time Slot
- Đề xuất lịch
- Apply Schedule bằng Transaction
- AI Assistant
- Fallback khi AI chưa được cấu hình

---

# Tech Stack

## Backend

- Node.js 20
- Express
- TypeScript
- Prisma ORM
- MySQL 8
- Zod
- JWT
- Bcrypt.js
- Helmet

## Frontend

- React 18
- TypeScript
- Vite
- TailwindCSS
- Zustand
- Axios
- Lucide Icons

## Infrastructure

- Docker
- Docker Compose
- Nginx

---

# Project Structure

```text
Planora/
│
├── BE/
│   ├── prisma/
│   ├── src/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── FE/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docs/
├── docker-compose.yml
└── README.md
```

Chi tiết xem tại:

```text
docs/PROJECT_STRUCTURE.md
```

---

# Environment Configuration

## Backend

Tạo:

```text
BE/.env
```

từ:

```text
BE/.env.example
```

Ví dụ:

```env
NODE_ENV=development
PORT=5000

CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

DATABASE_URL="mysql://root:password@localhost:3306/planora_db"

JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN=7d

AI_PROVIDER=none
AI_API_KEY=""
AI_MODEL=gemini-1.5-flash
```

> Không commit `.env` hoặc API Key lên GitHub.

## Frontend

Tạo:

```text
FE/.env
```

Local:

```env
VITE_API_URL=http://localhost:5000/api
```

Docker:

```env
VITE_API_URL=/api
```

---

# Local Development

## 1. Database

Planora sử dụng MySQL 8.

```sql
CREATE DATABASE IF NOT EXISTS planora_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

## 2. Backend

```bash
cd BE

npm ci

npx prisma generate
npx prisma migrate deploy

npm run build
npm run dev
```

Backend:

```text
http://localhost:5000/api
```

Health Check:

```text
http://localhost:5000/api/health
```

Database Readiness:

```text
http://localhost:5000/api/ready
```

## 3. Frontend

```bash
cd FE

npm ci
npm run build
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Database Migration

Production:

```bash
npx prisma migrate deploy
```

Development:

```bash
npx prisma migrate dev
```

Không sử dụng `prisma migrate dev` trong production.

Các category mặc định như `Work`, `Study`, `Personal` và `Health` được tạo trong quá trình đăng ký tài khoản.

---

# Integration Testing

Chạy Backend Integration Test:

```bash
cd BE
npm run test:integration
```

Kết quả hiện tại:

```text
PLANORA TEST RESULTS SUMMARY

Passed: 45
Failed: 0
Total:  45
```

Test bao gồm:

- Authentication
- User Data Isolation
- Tasks
- Events
- Timetables
- Habits
- Notifications
- Dashboard
- AI Fallback

---

# AI Smart Scheduling

Luồng xử lý:

```text
Tasks
  ↓
Priority Analysis
  ↓
Free Slot Detection
  ↓
AI Recommendation
  ↓
Schedule Proposal
  ↓
User Confirmation
  ↓
Apply Schedule
```

AI không tự động thay đổi lịch của người dùng nếu chưa đi qua luồng xác nhận của hệ thống.

Mặc định:

```env
AI_PROVIDER=none
```

Khi AI chưa được cấu hình, các chức năng chính vẫn hoạt động bình thường.

Kiểm tra trạng thái AI:

```http
GET /api/ai/status
```

Ví dụ:

```json
{
  "enabled": false
}
```

## Enable Gemini

```env
AI_PROVIDER=gemini
AI_API_KEY=your_api_key
AI_MODEL=gemini-1.5-flash
```

## Enable OpenAI

```env
AI_PROVIDER=openai
AI_API_KEY=your_api_key
AI_MODEL=your_model
```

Sau khi thay đổi `.env`, restart Backend.

---

# Docker Deployment

Khởi chạy toàn bộ hệ thống:

```bash
docker compose config

docker compose build --no-cache

docker compose up -d
```

Kiểm tra container:

```bash
docker compose ps
```

Xem log:

```bash
docker compose logs -f backend
```

Dừng hệ thống:

```bash
docker compose down
```

Xóa cả database volume:

```bash
docker compose down -v
```

> `docker compose down -v` sẽ xóa dữ liệu được lưu trong Docker volume.

## Docker Endpoints

Frontend:

```text
http://localhost
```

Backend:

```text
http://localhost:5000/api
```

Health:

```text
http://localhost:5000/api/health
```

Ready:

```text
http://localhost:5000/api/ready
```

---

# Nginx

Khi chạy Docker, Nginx:

1. Serve React Frontend.
2. Reverse Proxy `/api` tới Backend.
3. Hỗ trợ SPA Routing.

Ví dụ:

```nginx
location /api/ {
    proxy_pass http://backend:5000/api/;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

Nhờ đó các route như:

```text
/dashboard
/tasks
/calendar
/timetable
/profile
/settings
```

có thể refresh trực tiếp mà không gặp lỗi `404`.

---

# Security

Planora áp dụng:

- JWT Authentication
- Bcrypt Password Hashing
- Zod Validation
- Helmet Security Headers
- Environment Variables
- User Data Isolation
- Production Error Handling
- Prisma Transactions
- UTF-8 (`utf8mb4`)

Các secret như:

```text
DATABASE_URL
JWT_SECRET
AI_API_KEY
```

chỉ được lưu trong `.env` và không được commit lên repository.

---

# Main API

Base URL:

```text
http://localhost:5000/api
```

Một số endpoint chính:

```http
POST /api/auth/register
POST /api/auth/login

GET  /api/tasks
POST /api/tasks

GET  /api/events
POST /api/events

GET  /api/timetables
GET  /api/habits
GET  /api/notifications
GET  /api/dashboard

GET  /api/ai/status
```

Danh sách đầy đủ:

```text
docs/API.md
```

---

# Before Demo

Backend:

```bash
cd BE
npm run build
npm run test:integration
```

Frontend:

```bash
cd FE
npm run build
```

Nếu sử dụng Docker:

```bash
docker compose ps
```

Đảm bảo:

- Database hoạt động
- Backend kết nối được MySQL
- Frontend gọi được API
- Login hoạt động
- Task và Calendar có dữ liệu demo
- Notification hoạt động
- Dashboard có dữ liệu
- AI API Key hợp lệ nếu demo AI
- Có phương án fallback nếu AI gặp lỗi

Checklist đầy đủ:

```text
docs/DEMO_CHECKLIST.md
```

---

# Notes

- Không push `.env` lên GitHub.
- Không hard-code API Key trong source code.
- Chỉ commit `.env.example`.
- Chạy migration sau khi thay đổi database schema.
- Build Backend và Frontend trước khi release.
- Chạy Integration Test trước khi release.
- Không sử dụng `prisma migrate dev` trong production.
- Cẩn thận với `docker compose down -v` vì lệnh này xóa database volume.

---

# Planora v1.0.0

Planora v1.0.0 tập trung vào quản lý lịch trình cá nhân thông qua **Tasks, Calendar, Timetable, Habits, Notifications và Dashboard**.

**AI Smart Scheduling** hỗ trợ phân tích công việc, tìm khoảng thời gian trống và đề xuất lịch phù hợp nhưng không thay thế các chức năng cốt lõi của hệ thống.

Project hỗ trợ **Local Development, Integration Testing và Docker Deployment**, phục vụ quá trình phát triển, kiểm thử, demo và triển khai.
