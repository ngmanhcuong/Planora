# 📋 Planora - System Use Case Specifications

**Release Identifier**: Planora Core v1.0.0  

This document details the functional use cases of Planora written for software engineering evaluation.

**Primary Actor**: Student / Professional User

---

## UC01: User Registration
- **Actor**: Visitor / Student
- **Preconditions**: Visitor has no existing account and is on `/register` page.
- **Main Flow**:
  1. User enters name, email, password, and password confirmation.
  2. User submits registration form.
  3. System validates input against Zod schema rules.
  4. System hashes password using bcrypt and creates new `User` record.
  5. System automatically initializes default system categories (`STUDY`, `WORK`, `PERSONAL`, `HABIT`).
  6. System generates JWT access token and logs user in.
- **Alternative/Error Flow**:
  - *Email Already Exists*: System returns HTTP 400 with message `"Email đã được sử dụng"`. Form displays inline validation error.
  - *Validation Failure*: Form displays password mismatch or field length warning.
- **Postconditions**: User account is created and user is redirected to Dashboard.

---

## UC02: User Login
- **Actor**: Registered User
- **Preconditions**: User account exists and user is on `/login` page.
- **Main Flow**:
  1. User enters registered email and password.
  2. System validates input credentials.
  3. System compares password hash with stored hash via bcrypt.
  4. System returns JWT token and user details.
  5. Frontend stores token in Zustand/local storage and sets authentication header.
- **Alternative/Error Flow**:
  - *Invalid Credentials*: System returns HTTP 401 `"Email hoặc mật khẩu không chính xác"`.
- **Postconditions**: User session is established and user navigates to Dashboard.

---

## UC03: Manage Profile
- **Actor**: Authenticated User
- **Preconditions**: User is logged in and navigates to Profile page (`/profile`).
- **Main Flow**:
  1. User views current profile details (student ID, major, university, GPA, credit progress).
  2. User edits desired fields and clicks "Lưu thay đổi" (Save Changes).
  3. System validates data types and updates `Profile` database record.
- **Alternative/Error Flow**:
  - *Invalid Credit Count*: System rejects negative numeric values.
- **Postconditions**: Profile information is updated in database and reflected on UI.

---

## UC04: Manage Tasks
- **Actor**: Authenticated User
- **Preconditions**: User is logged in and navigates to Tasks view (`/tasks`).
- **Main Flow**:
  1. User clicks "Tạo công việc" (Create Task).
  2. User provides title, priority, due date, category, and optional description.
  3. User submits task.
  4. System saves task under current `userId`.
  5. User can filter tasks by priority or status, mark tasks as completed, or delete tasks.
- **Alternative/Error Flow**:
  - *Missing Due Date*: System blocks submission and highlights required field.
- **Postconditions**: Task is stored and displayed in task list with accurate `isOverdue` status.

---

## UC05: Manage Events
- **Actor**: Authenticated User
- **Preconditions**: User is logged in.
- **Main Flow**:
  1. User opens event modal on Tasks/Calendar screen.
  2. User specifies title, start time, end time, location, and color tag.
  3. System verifies `startTime < endTime` and persists event.
- **Alternative/Error Flow**:
  - *End Time Before Start Time*: System highlights invalid time range error.
- **Postconditions**: Event is saved to `Event` table.

---

## UC06: View Calendar
- **Actor**: Authenticated User
- **Preconditions**: User is logged in and navigates to Calendar (`/calendar`).
- **Main Flow**:
  1. System queries events and tasks matching active view range (Month/Week/Day).
  2. System aggregates entries into unified interactive calendar grid.
- **Alternative/Error Flow**:
  - *No Events in Range*: System renders empty calendar grid cleanly.
- **Postconditions**: User views combined visual schedule.

---

## UC07: Manage Timetable
- **Actor**: Authenticated User
- **Preconditions**: User is logged in and navigates to Timetable (`/timetable`).
- **Main Flow**:
  1. User creates semester timetable (e.g. "Học kỳ 1 2026-2027").
  2. User adds class slots (Subject name, Day of week 0-6, Class slot 1-10, Room, Lecturer).
  3. System updates timetable items and calculates total credits.
- **Alternative/Error Flow**:
  - *Overlapping Slot Span*: System warns user of class time overlap.
- **Postconditions**: Weekly academic timetable is persisted and synced to weekly calendar view.

---

## UC08: Track Habits
- **Actor**: Authenticated User
- **Preconditions**: User is logged in and navigates to Habits (`/habits`).
- **Main Flow**:
  1. User views habits list and current streak counts.
  2. User clicks "Check-in" button for today's habit.
  3. System logs `HabitLog` entry, updates `currentStreak`, and updates `lastCompletedDate`.
- **Alternative/Error Flow**:
  - *Uncheck Habit*: Toggling check-in off removes daily log entry and recalculates streak.
- **Postconditions**: Streak count and daily completion status are updated live.

---

## UC09: View Dashboard
- **Actor**: Authenticated User
- **Preconditions**: User is logged in (`/dashboard`).
- **Main Flow**:
  1. Dashboard fetches summary stats: total pending tasks, today's classes, habit completion percentage, and overdue counts.
  2. System displays interactive analytics widgets.
- **Alternative/Error Flow**:
  - *API Interruption*: Shows clean retry prompt.
- **Postconditions**: User sees real-time productivity overview.

---

## UC10: Manage Notifications
- **Actor**: Authenticated User
- **Preconditions**: User is logged in.
- **Main Flow**:
  1. User clicks bell icon on top navigation header.
  2. System displays unread notification drawer.
  3. User clicks "Đánh dấu tất cả đã đọc" (Mark all as read).
  4. System updates notification state and resets badge count to 0.
- **Alternative/Error Flow**:
  - *No Unread Notifications*: Drawer shows empty state message.
- **Postconditions**: Notification read states are updated in database.

---

## UC11: AI Task Prioritization
- **Actor**: Authenticated User
- **Preconditions**: User is logged in and has pending tasks.
- **Main Flow**:
  1. User clicks "AI Ưu tiên công việc" (AI Prioritize Tasks).
  2. Backend sends task titles and due dates to AI service.
  3. AI ranks tasks into urgent, important, and routine tiers with rationale.
  4. User views advisory ranking recommendations.
- **Alternative/Error Flow**:
  - *AI Disabled (`AI_PROVIDER=none`)*: Returns HTTP 503 fallback explaining AI is unconfigured.
- **Postconditions**: User receives advisory task order (no direct DB modification).

---

## UC12: AI Smart Scheduling
- **Actor**: Authenticated User
- **Preconditions**: User has open tasks and calendar gaps.
- **Main Flow**:
  1. User opens AI Smart Scheduling modal and selects date range.
  2. System calculates free calendar slots deterministically and passes context to AI provider.
  3. AI suggests focus session slots for pending tasks.
  4. User reviews proposed preview modal and clicks "Áp dụng lịch" (Apply Schedule).
  5. Backend revalidates time slots and saves new calendar events inside a Prisma `$transaction`.
- **Alternative/Error Flow**:
  - *User Rejects Recommendation*: User clicks "Hủy" (Cancel); zero changes made to DB.
- **Postconditions**: Approved focus blocks are saved as events in database.

---

## UC13: AI Productivity Assistant
- **Actor**: Authenticated User
- **Preconditions**: User is logged in.
- **Main Flow**:
  1. User opens AI Assistant chat drawer.
  2. User types prompt (e.g. "Tôi nên sắp xếp tuần này như thế nào?").
  3. AI responds with contextual productivity recommendations.
- **Alternative/Error Flow**:
  - *Network Failure*: Shows error banner with retry button.
- **Postconditions**: Conversational guidance displayed to user.

---

## UC14: Manage User Settings
- **Actor**: Authenticated User
- **Preconditions**: User is logged in (`/settings`).
- **Main Flow**:
  1. User changes UI theme (Light/Dark) or notification preferences.
  2. System updates `UserSetting` record and applies theme class to document body.
- **Alternative/Error Flow**:
  - *Password Update Failure*: Wrong current password returns HTTP 400 error.
- **Postconditions**: App appearance and settings preferences updated.

---

## UC15: User Logout
- **Actor**: Authenticated User
- **Preconditions**: User is logged in.
- **Main Flow**:
  1. User clicks "Đăng xuất" (Logout) in profile menu.
  2. Frontend clears stored auth token and resets Zustand auth state.
  3. User is redirected to `/login` page.
- **Alternative/Error Flow**: None.
- **Postconditions**: Client token cleared and session ended.
