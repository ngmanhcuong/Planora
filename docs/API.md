# 🔌 Planora - API Endpoint Documentation

**Release Identifier**: Planora Core v1.0.0  

All API endpoints are prefixed with `/api`. Authenticated endpoints require an `Authorization: Bearer <token>` header.

---

## 🏥 Health & System Endpoints

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | System liveness probe. Returns HTTP 200 and API status. |
| `GET` | `/api/ready` | No | System readiness probe. Verifies database connectivity. |

---

## 🔑 Authentication Endpoints (`/api/auth`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | No | Registers new user and initializes default categories. |
| `POST` | `/api/auth/login` | No | Authenticates credentials and returns JWT `accessToken`. |
| `GET` | `/api/auth/me` | Yes | Retrieves currently authenticated user profile and settings. |

---

## 👤 Profile Endpoints (`/api/profile`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/profile` | Yes | Fetches user profile (student ID, major, GPA, credits). |
| `PATCH` | `/api/profile` | Yes | Updates profile fields. |

---

## ⚙️ Settings Endpoints (`/api/settings`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/settings` | Yes | Fetches user application preferences and settings. |
| `PATCH` | `/api/settings` | Yes | Updates settings (theme, notifications, language). |
| `PATCH` | `/api/settings/password` | Yes | Changes user password securely after verifying current password. |

---

## 📝 Task Management Endpoints (`/api/tasks`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/tasks` | Yes | Lists tasks with status, priority, category, and date filtering. |
| `POST` | `/api/tasks` | Yes | Creates new task. |
| `GET` | `/api/tasks/:id` | Yes | Retrieves task details with derived `isOverdue` status. |
| `PATCH` | `/api/tasks/:id` | Yes | Updates task details, status, or completion state. |
| `DELETE` | `/api/tasks/:id` | Yes | Deletes specified task. |
| `PATCH` | `/api/tasks/:id/status` | Yes | Toggles task status (`TODO`, `IN_PROGRESS`, `COMPLETED`). |

---

## 📅 Events & Calendar Endpoints (`/api/events` & `/api/calendar`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/events` | Yes | Lists user calendar events. |
| `POST` | `/api/events` | Yes | Creates scheduled event. |
| `GET` | `/api/events/:id` | Yes | Retrieves event details. |
| `PATCH` | `/api/events/:id` | Yes | Updates event parameters or recurrence. |
| `DELETE` | `/api/events/:id` | Yes | Deletes event. |
| `GET` | `/api/calendar` | Yes | Aggregates events and tasks across date range for calendar views. |

---

## 📚 Timetable Endpoints (`/api/timetables` & `/api/timetable`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/timetables` | Yes | Lists academic semester timetables. |
| `POST` | `/api/timetables` | Yes | Creates new academic timetable metadata. |
| `POST` | `/api/timetables/:id/items` | Yes | Adds class slot item to timetable. |
| `PATCH` | `/api/timetables/:id/items/:itemId` | Yes | Updates timetable class slot. |
| `DELETE` | `/api/timetables/:id/items/:itemId` | Yes | Deletes class slot. |
| `GET` | `/api/timetable/week` | Yes | Fetches active timetable expanded across current week. |

---

## 🔥 Habit Tracking Endpoints (`/api/habits`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/habits` | Yes | Lists user habits with calculated streaks. |
| `POST` | `/api/habits` | Yes | Creates new habit. |
| `GET` | `/api/habits/:id` | Yes | Gets habit details and check-in log history. |
| `POST` | `/api/habits/:id/check-in` | Yes | Toggles check-in log for given date and recalculates streak. |
| `DELETE` | `/api/habits/:id` | Yes | Deletes habit and associated logs. |

---

## 🔔 Notification Endpoints (`/api/notifications`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/notifications` | Yes | Retrieves list of notifications. |
| `GET` | `/api/notifications/unread-count` | Yes | Returns numeric unread notification count badge. |
| `PATCH` | `/api/notifications/:id/read` | Yes | Marks notification as read. |
| `PATCH` | `/api/notifications/read-all` | Yes | Marks all user notifications as read. |

---

## 📊 Dashboard Endpoints (`/api/dashboard`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/dashboard` | Yes | Returns summary overview (task metrics, upcoming events, habit progress). |
| `GET` | `/api/dashboard/statistics/weekly` | Yes | Returns weekly completion statistics and productivity analytics. |

---

## 🤖 AI Scheduling Endpoints (`/api/ai`)

| Method | Path | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/ai/status` | Yes | Returns AI configuration status (`enabled: boolean`, provider name). |
| `POST` | `/api/ai/prioritize-tasks` | Yes | Analyzes tasks and provides advisory priority ranking suggestions. |
| `POST` | `/api/ai/schedule` | Yes | Generates recommended focus session slots into free calendar gaps. |
| `POST` | `/api/ai/schedule/apply` | Yes | Explicitly applies accepted AI schedule recommendation into database. |
| `POST` | `/api/ai/assistant` | Yes | Conversational assistant providing productivity guidance. |
