# 📊 Planora - Slide Presentation Outline (15 Slides)

**Release Identifier**: Planora Core v1.0.0  

This outline structures the slide deck presentation for academic project defense and evaluation.

---

### Slide 1: Cover & Title
- **Title**: Planora - Smart Personal Schedule & Task Management System
- **Bullets**:
  - Comprehensive Productivity Platform for Students & Professionals
  - Presented by: Planora Engineering Team
  - Technology: React 18, Node.js, Express, Prisma, MySQL 8.0, TypeScript
- **Presenter Script**: "Xin chào Thầy Cô và các bạn. Nhóm chúng em xin báo cáo đồ án Planora - Hệ thống quản lý lịch trình và công việc cá nhân thông minh."

---

### Slide 2: Problem Statement
- **Title**: The Modern Productivity Challenge
- **Bullets**:
  - Fragmented tools (calendar in one app, tasks in another, timetable on paper).
  - Class schedule conflicts with project deadline planning.
  - Difficulty maintaining daily habit streaks.
  - Overwhelming manual effort required to plan focus study sessions.
- **Presenter Script**: "Sinh viên hiện nay gặp khó khăn trong việc quản lý chồng chéo giữa thời khóa biểu học tập, hạn nộp bài tập và lịch làm việc nhóm."

---

### Slide 3: The Planora Solution
- **Title**: Unified & Intelligent Productivity Hub
- **Bullets**:
  - Unified view of Tasks, Events, and Academic Timetables.
  - Real-time Dashboard analytics and streak tracking.
  - Advisory AI Smart Scheduling that calculates free gaps automatically.
  - Multi-tenant data isolation and high-performance React UI.
- **Presenter Script**: "Planora giải quyết vấn đề bằng một nền tảng hợp nhất tích hợp AI cố vấn thông minh giúp sinh viên tối ưu hóa quỹ thời gian."

---

### Slide 4: Core Product Features
- **Title**: Feature Overview Matrix
- **Bullets**:
  - JWT Auth & Security Settings.
  - Task Management with overdue status semantics.
  - Academic Timetable & Calendar aggregation.
  - Habit Streak Check-ins & In-App Notifications.
  - AI Task Prioritization & Smart Free-Slot Scheduling.
- **Presenter Script**: "Planora bao gồm 10 phân hệ chính đáp ứng toàn bộ nhu cầu quản lý công việc và học tập."

---

### Slide 5: System Architecture
- **Title**: Decoupled Multi-Tier Architecture
- **Bullets**:
  - Frontend: React 18 SPA (Vite, TypeScript, TailwindCSS).
  - Backend: Node.js, Express, Zod, Helmet.
  - Database: MySQL 8.0 with Prisma ORM.
  - Infrastructure: Docker Compose & Nginx Reverse Proxy.
- **Presenter Script**: "Kiến trúc hệ thống được chia làm các tầng độc lập giúp dễ dàng mở rộng và bảo trì."

---

### Slide 6: Database & Data Modeling
- **Title**: Relational Database Design (11 Core Entities)
- **Bullets**:
  - `User`, `Profile`, `UserSetting`.
  - `Category`, `Task`, `Event`.
  - `Timetable` & `TimetableItem` (Academic 7-day mapping).
  - `Habit` & `HabitLog` (Consecutive streak metrics).
  - `Notification`.
- **Presenter Script**: "CSDL được thiết kế chuẩn hóa 3NF với 11 bảng được quản lý chặt chẽ qua Prisma ORM."

---

### Slide 7: Frontend Architecture
- **Title**: React 18 Component & State Architecture
- **Bullets**:
  - Domain-driven feature layout (`src/features/`).
  - Zustand for client UI state & authentication token.
  - TanStack Query for server state caching & automatic refetching.
  - React Hook Form + Zod for runtime form validation.
- **Presenter Script**: "Tầng Frontend kết hợp Zustand và React Query giúp phân định rõ ràng giữa UI State và Server Cache."

---

### Slide 8: Backend & API Architecture
- **Title**: Express REST API & Security Pipeline
- **Bullets**:
  - Feature module routing (`BE/src/modules/`).
  - Zod validation middleware for strictly typed requests.
  - JWT Bearer token authentication middleware.
  - Multi-tenant database query scoping (`userId` filter).
- **Presenter Script**: "Backend tuân thủ REST API chuẩn hóa với middleware kiểm tra quyền sở hữu dữ liệu trên từng truy vấn."

---

### Slide 9: Task, Calendar & Timetable Integration
- **Title**: Seamless Schedule Synergy
- **Bullets**:
  - Timetables map 10 class slots across Monday–Sunday.
  - Calendar view merges events, class slots, and task due dates.
  - Task overdue state is derived dynamically (`dueDate < NOW` and incomplete).
- **Presenter Script**: "Tất cả lịch học, sự kiện và hạn nộp bài tập được hợp nhất trên một giao diện Lịch trực quan."

---

### Slide 10: AI Architecture & Hybrid Design
- **Title**: Hybrid AI Design Strategy
- **Bullets**:
  - Why Hybrid? LLMs cannot reliably perform conflict-free date arithmetic.
  - TypeScript Free-Slot Engine handles math.
  - LLM provides task ranking & contextual rationale.
  - Strictly Advisory: User explicit confirmation required.
- **Presenter Script**: "Chúng em sử dụng kiến trúc AI Hybrid: thuật toán mã nguồn mở tính khoảng trống chính xác 100%, LLM đóng vai trò cố vấn."

---

### Slide 11: AI Smart Scheduling Workflow
- **Title**: End-to-End AI Scheduling Flow
- **Bullets**:
  - 1. Context Extraction (Tasks + Events + Classes).
  - 2. Deterministic Free-Slot Calculation.
  - 3. LLM Recommendation Generation.
  - 4. Interactive UI Preview & User Approval.
  - 5. Server Revalidation & Prisma `$transaction` Commit.
- **Presenter Script**: "Quy trình 5 bước đảm bảo lịch tự học được chèn an toàn và không bao giờ gây trùng lịch."

---

### Slide 12: Security & Privacy Protections
- **Title**: Multi-Layer Security Hardening
- **Bullets**:
  - Bcrypt password hashing (10 salt rounds).
  - Helmet HTTP security headers & restricted CORS.
  - AI Prompt-injection defenses & data minimization.
  - Global production error sanitization.
- **Presenter Script**: "Bảo mật được chú trọng từ mã hóa mật khẩu, tiêu đề Helmet đến bảo vệ quyền riêng tư dữ liệu gửi tới AI."

---

### Slide 13: Testing & Quality Assurance
- **Title**: 45-Point Integration Test Suite
- **Bullets**:
  - 10 Test Groups covering Auth, CRUD, Isolation, & AI fallbacks.
  - 100% Pass Rate across 45 automated test scenarios.
  - Portability verified across local and containerized environments.
- **Presenter Script**: "Hệ thống đã trải qua bộ test tự động 45 kịch bản tích hợp đạt tỷ lệ vượt qua 100%."

---

### Slide 14: Live Product Demonstration
- **Title**: Planora System Live Demo
- **Bullets**:
  - Real-time navigation of Dashboard, Tasks, Timetable, & Habits.
  - Live execution of AI Smart Free-Slot Scheduling.
  - Mobile-responsive UI & Dark Mode transition.
- **Presenter Script**: "Sau đây em xin phép chuyển sang phần trực tiếp trình diễn các tính năng trên ứng dụng."

---

### Slide 15: Conclusion & Future Roadmap
- **Title**: Conclusion & Future Extensions
- **Bullets**:
  - Accomplished: Planora Core v1.0.0 fully verified and release-ready.
  - Future Work: Mobile native app (React Native), Redis JWT blacklist, and Google Calendar sync.
  - Thank you for listening!
- **Presenter Script**: "Đồ án Planora Core v1.0.0 đã hoàn thành xuất sắc mục tiêu. Chúng em xin cảm ơn Thầy Cô và sẵn sàng nhận câu hỏi phản biện."
