# Planora - Smart Personal Schedule & Task Management System

**Version:** 1.0.0  
**Release:** Planora Core v1.0.0  
**Status:** Final Release

Planora là hệ thống quản lý lịch trình và công việc cá nhân, được xây dựng chủ yếu cho sinh viên và người dùng có nhu cầu quản lý thời gian hằng ngày.

Hệ thống hỗ trợ quản lý công việc, sự kiện, thời khóa biểu, thói quen, thông báo và dashboard thống kê. Ngoài ra, Planora có tích hợp AI để hỗ trợ phân tích công việc và đề xuất cách sắp xếp lịch dựa trên các khoảng thời gian còn trống.

AI chỉ đóng vai trò hỗ trợ. Các chức năng chính của hệ thống vẫn có thể hoạt động khi AI chưa được cấu hình.

---

## Project Documentation

Các tài liệu chi tiết của project được lưu trong thư mục `docs/`:

- [System Architecture](docs/ARCHITECTURE.md): Kiến trúc tổng thể, component diagram và các công nghệ được sử dụng.
- [Project Structure](docs/PROJECT_STRUCTURE.md): Cấu trúc thư mục và trách nhiệm của từng phần trong `BE/`, `FE/` và root project.
- [Database Documentation](docs/DATABASE.md): Prisma data model và Entity-Relationship Diagram (ERD).
- [API Documentation](docs/API.md): Danh sách REST API của các module trong hệ thống.
- [User Feature Guide](docs/FEATURES.md): Mô tả các chức năng dành cho người dùng.
- [Security Architecture](docs/SECURITY.md): JWT authentication, bcrypt, data isolation và các xử lý liên quan đến bảo mật.
- [AI Design Specification](docs/AI_DESIGN.md): Thiết kế chức năng AI Scheduling và free-slot engine.
- [System Use Cases](docs/USE_CASES.md): Các Use Case của hệ thống từ UC01 đến UC15.
- [Presentation & Demo Script](docs/DEMO_SCRIPT.md): Kịch bản demo khoảng 7–10 phút.
- [Demo Data Preparation](docs/DEMO_DATA.md): Hướng dẫn chuẩn bị dữ liệu trước khi demo.
- [Presentation Slide Deck Outline](docs/PRESENTATION_OUTLINE.md): Nội dung dự kiến cho 15 slide thuyết trình.
- [Lecturer Defense Q&A](docs/DEFENSE_QA.md): Các câu hỏi và câu trả lời chuẩn bị cho phần bảo vệ.
- [Pre-Demo Checklist](docs/DEMO_CHECKLIST.md): Các bước cần kiểm tra trước khi demo.
- [Command Cheat Sheet](docs/COMMANDS.md): Các command thường dùng cho Backend, Frontend, Database, Testing và Docker.

---

## Architecture & Development Phases

Planora được phát triển theo từng phase, từ authentication, quản lý dữ liệu người dùng đến AI scheduling, testing và chuẩn bị deployment.

### B3 - Authentication & Security

- JWT authentication.
- Hash password bằng bcrypt.
- Validate dữ liệu đầu vào.
- Bảo vệ các API cần đăng nhập.

### B4 - Profile & Settings

- Quản lý thông tin profile.
- Thay đổi theme.
- Quản lý notification preferences.
- Cập nhật các thiết lập cá nhân.

### B5 - Task Management

- Tạo, xem, cập nhật và xóa task.
- Quản lý priority.
- Theo dõi due date.
- Xử lý trạng thái overdue.
- Tính priority score phục vụ việc sắp xếp task.

### B6 - Events & Calendar

- Tạo và quản lý event.
- Lọc event theo khoảng thời gian.
- Hiển thị dữ liệu cho calendar.
- Kiểm tra một số trường hợp trùng lịch.

### B7 - Timetable Management

- Quản lý thời khóa biểu theo tuần.
- Quản lý danh sách môn học.
- Cho phép bật/tắt timetable đang sử dụng.
- Kiểm tra xung đột thời gian.

### B8 - Habit Tracking

- Tạo và quản lý habit.
- Check-in habit hằng ngày.
- Tính streak.
- Quản lý target frequency.

### B9 - Notifications System

- Hiển thị notification trong ứng dụng.
- Theo dõi số lượng notification chưa đọc.
- Mark notification as read.
- Quản lý trạng thái notification.

### B10 - Dashboard Analytics

- Tổng hợp dữ liệu từ các module.
- Thống kê task.
- Tính completion rate.
- Theo dõi overdue task.
- Cung cấp dữ liệu cho dashboard.

### B11 - Frontend & Backend Integration

- Kết nối Frontend với Backend API.
- Sử dụng Axios cho HTTP request.
- Sử dụng Zustand cho state management.
- Thay thế mock data bằng dữ liệu từ Backend.

### B12 - AI Smart Scheduling & Assistant

- Phân tích task để hỗ trợ sắp xếp mức độ ưu tiên.
- Tìm khoảng thời gian trống.
- Đề xuất lịch dựa trên task và lịch hiện tại.
- Apply lịch bằng transaction.
- Hỗ trợ AI assistant.
- Có fallback khi AI chưa được cấu hình.

### B13 - Production Setup & E2E Validation

- Validate environment bằng Zod.
- Database readiness probe.
- Helmet security headers.
- Xử lý error response cho production.
- Integration testing.
- Docker containerization.

### B14 - Release Verification & Deployment Preparation

- Kiểm tra repository trước khi release.
- Kiểm tra secret và environment configuration.
- Kiểm tra đường dẫn trong project.
- Kiểm tra UTF-8.
- Chuẩn bị tài liệu deployment và demo.

---

## System Requirements & Tech Stack

### System Requirements

Project được phát triển và kiểm tra với các thành phần sau:

- **Node.js:** Node.js 20 LTS
- **Database:** MySQL 8.0
- **Package Manager:** npm 9.x trở lên
- **Docker:** Docker 24.x trở lên
- **Docker Compose:** Docker Compose v2.x trở lên

Docker không bắt buộc khi chạy local nhưng có thể được sử dụng để chạy toàn bộ hệ thống bằng container.

### Backend

Backend nằm trong thư mục `BE/` và sử dụng:

- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL 8.0
- Zod
- Helmet
- JWT
- Bcrypt.js

### Frontend

Frontend nằm trong thư mục `FE/` và sử dụng:

- React 18
- TypeScript
- Vite
- TailwindCSS
- Zustand
- Lucide Icons
- Axios

### Infrastructure

Các thành phần hỗ trợ deployment:

- Docker
- Docker Compose
- Nginx

Nginx được sử dụng để serve React frontend và reverse proxy request `/api` tới Backend khi chạy bằng Docker.

---

# Environment Configuration

## Backend

Backend sử dụng file:

```text
BE/.env
```

Có thể copy từ:

```text
BE/.env.example
```

Ví dụ:

```env
# Application Configuration

NODE_ENV=development
PORT=5000

CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173


# Database Connection

DATABASE_URL="mysql://root:password@localhost:3306/planora_db"


# JWT Configuration

JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN=7d


# AI Configuration

AI_PROVIDER=none
AI_API_KEY=""
AI_MODEL=gemini-1.5-flash
```

> Không commit file `.env` lên GitHub. Repository chỉ nên chứa `.env.example`.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | Environment hiện tại: `development`, `production` hoặc `test` |
| `PORT` | Yes | Port của Backend, mặc định `5000` |
| `DATABASE_URL` | Yes | Connection string tới MySQL |
| `JWT_SECRET` | Yes | Secret dùng để ký JWT |
| `JWT_EXPIRES_IN` | No | Thời gian hết hạn của token, mặc định `7d` |
| `FRONTEND_URL` | Yes | URL của Frontend |
| `CLIENT_URL` | Yes | Client origin được sử dụng cho CORS |
| `AI_PROVIDER` | No | AI provider: `none`, `gemini` hoặc `openai` |
| `AI_API_KEY` | No | API key khi sử dụng AI |
| `AI_MODEL` | No | Model AI được sử dụng |

Format của `DATABASE_URL`:

```text
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

---

## Frontend

Frontend sử dụng:

```text
FE/.env
```

Có thể copy từ:

```text
FE/.env.example
```

Khi chạy local:

```env
VITE_API_URL=http://localhost:5000/api
```

Khi chạy bằng Docker và Nginx:

```env
VITE_API_URL=/api
```

---

# Local Development

## 1. Database Setup

Đảm bảo MySQL 8.0 đang chạy.

Mặc định project sử dụng:

```text
Host: localhost
Port: 3306
Database: planora_db
```

Có thể tạo database bằng:

```sql
CREATE DATABASE IF NOT EXISTS planora_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

## 2. Backend Installation

Di chuyển vào Backend:

```bash
cd BE
```

Cài dependencies:

```bash
npm ci
```

Generate Prisma Client:

```bash
npx prisma generate
```

Chạy migration:

```bash
npx prisma migrate deploy
```

Build Backend:

```bash
npm run build
```

Chạy Backend ở development mode:

```bash
npm run dev
```

Backend API:

```text
http://localhost:5000/api
```

Health check:

```text
http://localhost:5000/api/health
```

Database readiness:

```text
http://localhost:5000/api/ready
```

---

## 3. Frontend Installation

Mở terminal khác và vào thư mục Frontend:

```bash
cd FE
```

Cài dependencies:

```bash
npm ci
```

Build Frontend:

```bash
npm run build
```

Chạy development server:

```bash
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

---

# Database Migration

Project sử dụng Prisma để quản lý database schema và migration.

Khi chạy production sử dụng:

```bash
npx prisma migrate deploy
```

Không sử dụng:

```bash
npx prisma migrate dev
```

trong production.

`migrate dev` chủ yếu được sử dụng trong quá trình development khi cần tạo hoặc chỉnh sửa migration.

## Database Seed

Project không yêu cầu database seed để chạy bình thường.

Các category mặc định như:

- Work
- Study
- Personal
- Health

được tạo trong quá trình đăng ký user.

---

# Automated Integration Testing

Backend có integration test để kiểm tra các chức năng chính như:

- Authentication
- User data isolation
- CRUD của các module
- Task management
- Events
- Timetables
- Habits
- Notifications
- Dashboard
- AI fallback

Để chạy integration test:

```bash
cd BE
npm run test:integration
```

Kết quả test hiện tại:

```text
PLANORA TEST RESULTS SUMMARY

Passed: 45
Failed: 0
Total:  45
```

---

# AI Smart Scheduling

AI trong Planora được sử dụng để hỗ trợ việc phân tích và đề xuất lịch.

Luồng xử lý cơ bản:

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

AI không tự động thay đổi dữ liệu lịch của người dùng nếu chưa đi qua luồng xử lý của hệ thống.

---

## Default AI Configuration

Mặc định:

```env
AI_PROVIDER=none
```

Khi:

```text
AI_PROVIDER=none
```

hoặc không có:

```text
AI_API_KEY
```

hệ thống vẫn có thể chạy mà không cần AI.

Endpoint:

```http
GET /api/ai/status
```

sẽ trả về trạng thái AI, ví dụ:

```json
{
  "enabled": false
}
```

Các endpoint cần AI có thể trả về:

```text
503 Service Unavailable
```

khi AI chưa được bật.

Các module chính vẫn hoạt động:

- Authentication
- Tasks
- Events
- Timetables
- Habits
- Notifications
- Dashboard

---

## Enable AI

Để bật Gemini:

```env
AI_PROVIDER=gemini
AI_API_KEY=your_api_key
AI_MODEL=gemini-1.5-flash
```

Hoặc sử dụng OpenAI:

```env
AI_PROVIDER=openai
AI_API_KEY=your_api_key
AI_MODEL=your_model
```

Sau khi thay đổi `.env`, restart Backend:

```bash
npm run dev
```

Nếu chạy bằng Docker thì restart container tương ứng.

---

# Docker Deployment

Project có thể chạy toàn bộ stack bằng Docker Compose.

Stack gồm:

```text
MySQL
  ↓
Express Backend
  ↓
Nginx
  ↓
React Frontend
```

---

## 1. Validate Docker Compose

```bash
docker compose config
```

---

## 2. Build Docker Images

```bash
docker compose build --no-cache
```

---

## 3. Start Containers

```bash
docker compose up -d
```

---

## 4. Check Container Status

```bash
docker compose ps
```

---

## 5. Container Endpoints

### Frontend

```text
http://localhost:80
```

### Backend API

```text
http://localhost:5000/api
```

### Backend Health Check

```text
http://localhost:5000/api/health
```

### Database Readiness

```text
http://localhost:5000/api/ready
```

---

## 6. View Logs

Backend logs:

```bash
docker compose logs -f backend
```

Có thể kiểm tra toàn bộ logs bằng:

```bash
docker compose logs
```

---

## 7. Stop Containers

Dừng container:

```bash
docker compose down
```

Lệnh trên vẫn giữ database volume.

Nếu muốn xóa cả volume:

```bash
docker compose down -v
```

> Lưu ý: `docker compose down -v` sẽ xóa dữ liệu được lưu trong Docker volume.

Sau đó có thể khởi tạo lại bằng:

```bash
docker compose up -d
```

---

# Nginx Reverse Proxy

Khi chạy bằng Docker, Nginx đảm nhiệm hai việc chính:

1. Serve React Frontend.
2. Proxy các request `/api/` tới Backend.

Cấu hình cơ bản:

```nginx
location /api/ {
    proxy_pass http://backend:5000/api/;

    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Các route Frontend được xử lý bằng:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Cấu hình này giúp các route của React như:

```text
/dashboard
/tasks
/calendar
/timetable
/profile
/settings
```

có thể refresh trực tiếp mà không bị trả về lỗi `404`.

Khi sử dụng Nginx reverse proxy, Frontend có thể gọi:

```text
/api
```

thay vì gọi trực tiếp:

```text
http://localhost:5000/api
```

---

# CORS

Khi chạy Frontend và Backend riêng trong development:

```text
Frontend
http://localhost:5173

Backend
http://localhost:5000
```

Backend sử dụng:

```env
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

để xác định origin được phép truy cập API.

Khi chạy Docker với Nginx, Frontend và API được truy cập thông qua cùng một origin, giúp việc cấu hình CORS đơn giản hơn.

---

# Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| **Port 3306 already in use** | MySQL local đang sử dụng port `3306` | Stop MySQL local hoặc đổi host port trong `docker-compose.yml`, ví dụ `3307:3306` |
| **Port 5000 already in use** | Có application khác đang sử dụng port Backend | Dừng application đó hoặc thay đổi `PORT` |
| **Port 80 already in use** | Có web server/application khác đang dùng port `80` | Dừng service đang sử dụng port hoặc thay đổi Docker port mapping |
| **Prisma cannot connect to DB** | MySQL chưa chạy hoặc `DATABASE_URL` sai | Kiểm tra MySQL và thông tin trong `DATABASE_URL` |
| **Frontend cannot reach Backend** | `VITE_API_URL` không đúng | Local dùng `http://localhost:5000/api`, Docker dùng `/api` |
| **AI returns HTTP 503** | AI chưa được cấu hình | Thêm `AI_API_KEY` và thay đổi `AI_PROVIDER` nếu muốn sử dụng AI |
| **SPA refresh gives 404** | Web server chưa có SPA fallback | Kiểm tra `try_files $uri $uri/ /index.html;` trong Nginx |
| **Docker database data disappeared** | Đã chạy `docker compose down -v` | Volume đã bị xóa, cần khởi tạo lại database |

---

# Security & Reliability

## JWT Authentication

Các API cần đăng nhập sử dụng JWT để xác thực user.

Token được tạo sau khi user đăng nhập thành công và được kiểm tra ở các protected routes.

---

## Password Hashing

Password không được lưu trực tiếp dưới dạng plain text.

Backend sử dụng:

```text
bcrypt
```

để hash password trước khi lưu vào database.

---

## Environment Variables

Các thông tin như:

```text
DATABASE_URL
JWT_SECRET
AI_API_KEY
```

được lưu trong:

```text
.env
```

File `.env` được ignore bởi Git và không nên được commit lên repository.

Repository chỉ giữ:

```text
.env.example
```

để làm file cấu hình mẫu.

---

## Helmet

Backend sử dụng Helmet để thêm các HTTP security headers cho Express.

---

## Production Error Handling

Khi:

```env
NODE_ENV=production
```

các thông tin lỗi nội bộ không được trả trực tiếp cho client.

Việc này hạn chế việc làm lộ stack trace hoặc các thông tin không cần thiết của Backend.

---

## User Data Isolation

Các query liên quan đến dữ liệu cá nhân được giới hạn theo user.

Ví dụ:

```ts
where: {
  id,
  userId
}
```

Mục đích là tránh trường hợp user có thể truy cập dữ liệu thuộc về tài khoản khác.

---

## Database Transactions

Các thao tác cần cập nhật nhiều dữ liệu cùng lúc, đặc biệt trong quá trình apply AI schedule, sử dụng Prisma transaction:

```ts
prisma.$transaction(...)
```

Nếu một bước trong transaction gặp lỗi, các thay đổi liên quan có thể được rollback.

---

## UTF-8 Support

Database sử dụng:

```text
utf8mb4
```

để hỗ trợ Unicode, bao gồm tiếng Việt.

Ví dụ cấu hình database:

```sql
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

# Project Structure

Cấu trúc tổng quát:

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
│   │
│   ├── tests/
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
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
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── FEATURES.md
│   ├── SECURITY.md
│   ├── AI_DESIGN.md
│   ├── USE_CASES.md
│   ├── DEMO_SCRIPT.md
│   ├── DEMO_DATA.md
│   ├── PRESENTATION_OUTLINE.md
│   ├── DEFENSE_QA.md
│   ├── DEMO_CHECKLIST.md
│   └── COMMANDS.md
│
├── docker-compose.yml
└── README.md
```

Chi tiết từng thư mục được mô tả trong:

```text
docs/PROJECT_STRUCTURE.md
```

---

# Main Modules

Planora hiện gồm các module chính:

```text
Auth
Profile
Settings
Tasks
Events
Timetables
Habits
Notifications
Dashboard
AI Scheduling
```

Mỗi module Backend được tách riêng để dễ quản lý và mở rộng.

Ví dụ:

```text
src/modules/tasks/
src/modules/events/
src/modules/habits/
src/modules/notifications/
```

Các phần như controller, service, schema, route và type được tổ chức theo từng module.

---

# API

Base URL khi chạy local:

```text
http://localhost:5000/api
```

Ví dụ:

```http
POST /api/auth/register
POST /api/auth/login

GET /api/tasks
POST /api/tasks

GET /api/events
POST /api/events

GET /api/timetables

GET /api/habits

GET /api/notifications

GET /api/dashboard

GET /api/ai/status
```

Danh sách endpoint chi tiết nằm trong:

```text
docs/API.md
```

---

# Before Demo / Presentation

Trước khi demo nên kiểm tra:

```bash
docker compose ps
```

hoặc khi chạy local:

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

Kiểm tra thêm:

- Database đang hoạt động.
- Backend kết nối được MySQL.
- Frontend gọi được Backend API.
- Login hoạt động.
- Task và Calendar có dữ liệu demo.
- Notification hoạt động.
- Dashboard có dữ liệu.
- AI API key hợp lệ nếu demo AI.
- Có phương án demo không dùng AI nếu AI service gặp lỗi.

Checklist chi tiết:

```text
docs/DEMO_CHECKLIST.md
```

---

# Notes

Một số lưu ý khi làm việc với project:

- Không push `.env` lên GitHub.
- Không lưu API key trực tiếp trong source code.
- Sử dụng `.env.example` để mô tả các environment variable cần thiết.
- Chạy Prisma migration sau khi database schema thay đổi.
- Kiểm tra Backend và Frontend build trước khi push các thay đổi lớn.
- Chạy integration test trước khi release.
- Không sử dụng `prisma migrate dev` trong production.
- Cẩn thận khi sử dụng `docker compose down -v` vì command này xóa database volume.

---

# Planora v1.0.0

Phiên bản hiện tại tập trung vào các chức năng quản lý lịch trình cá nhân gồm task, calendar, timetable, habit, notification và dashboard.

AI Scheduling được bổ sung để hỗ trợ người dùng trong việc tìm khoảng thời gian phù hợp và đề xuất lịch dựa trên dữ liệu hiện có.

Project cũng đã có cấu hình cho local development, integration testing và Docker deployment để thuận tiện cho việc phát triển, kiểm thử và demo.
