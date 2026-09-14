# 🧪 Planora - Manual Demo Data Preparation Guide

**Release Identifier**: Planora Core v1.0.0  

This guide provides instructions for manually preparing presentation data in Planora prior to a live demonstration or grading review.

> [!IMPORTANT]
> **No Automatic Database Seeding**: Planora does not populate fake data automatically during startup to protect clean production environments. All demo data must be created through the normal UI application workflow or prepared manually in a dedicated demonstration database.

---

## 👤 1. Demo User Account Setup

Register a clean demo account on the registration page (`/register`):
- **Full Name**: `Nguyễn Văn Ánh`
- **Email**: `demo@planora.vn`
- **Password**: `Password123!`
- **Confirm Password**: `Password123!`

---

## 📝 2. Demo Task Portfolio

Create the following sample tasks under Tasks (`/tasks`):

| Task Title | Priority | Due Date | Category | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Hoàn thành báo cáo SWE201** | `HIGH` | Tomorrow 17:00 | Study | `IN_PROGRESS` |
| **Ôn tập lý thuyết DBI202** | `URGENT` | Today 22:00 | Study | `TODO` |
| **Chuẩn bị slide thuyết trình đồ án** | `MEDIUM` | In 2 Days 12:00 | Work | `TODO` |
| **Nộp bài tập tuần 4 PRJ301** | `LOW` | In 4 Days 23:59 | Study | `COMPLETED` |

---

## 📅 3. Demo Event Portfolio

Create the following events under Calendar (`/calendar`):

| Event Title | Start Time | End Time | Location | Recurrence |
| :--- | :---: | :---: | :---: | :---: |
| **Họp nhóm đồ án tốt nghiệp** | Tomorrow 14:00 | Tomorrow 16:00 | Lab 302 | Weekly |
| **Seminar Công nghệ AI 2026** | In 3 Days 09:00 | In 3 Days 11:30 | Hội trường A | None |

---

## 📚 4. Demo Academic Timetable

Create a timetable under Timetable (`/timetable`) with term name `"Học kỳ 1 2026-2027"`:

| Subject Name | Code | Day | Slot Range | Room | Lecturer | Type |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Kỹ thuật phần mềm (SWE201)** | `SWE201` | Mon (Thứ 2) | Slot 1–3 (07:00–09:30) | R201 | TS. Nguyễn Văn A | `THEORY` |
| **Cơ sở dữ liệu (DBI202)** | `DBI202` | Wed (Thứ 4) | Slot 4–6 (09:45–12:15) | Lab 105 | ThS. Trần Thị B | `PRACTICE` |
| **Lập trình Java Web (PRJ301)** | `PRJ301` | Fri (Thứ 6) | Slot 7–9 (13:00–15:30) | R304 | TS. Lê Văn C | `THEORY` |

---

## 🔥 5. Demo Habit Portfolio

Create habits under Habits (`/habits`):

| Habit Title | Target Frequency | Icon | Color | Current Streak |
| :--- | :---: | :---: | :---: | :---: |
| **Đọc sách CNTT 30 phút** | 7 days/week | 📖 Book | `#006E4B` | 5 Days |
| **Luyện gõ Code / LeetCode** | 5 days/week | 💻 Laptop | `#4F46E5` | 3 Days |
| **Tập thể dục buổi sáng** | 5 days/week | 🏃 Activity | `#D97706` | 2 Days |

---

## 💡 Manual Preparation Sequence

1. Start MySQL database and launch backend (`npm run dev` in `BE`) and frontend (`npm run dev` in `FE`).
2. Register the demo user account (`demo@planora.vn`).
3. Enter the academic timetable items first so class boundaries are set.
4. Add tasks and events as listed above.
5. Perform 1-2 habit check-ins to initialize non-zero streak visualizers.
6. Verify Dashboard widgets display complete, realistic metrics.
