# 📋 Planora - Final Pre-Demo & Defense Checklist

**Release Identifier**: Planora Core v1.0.0  

This checklist must be executed **30 minutes prior to the live demonstration or grading presentation**.

---

## ⏱️ Pre-Presentation Checklist (T-30 Minutes)

- [ ] **1. Infrastructure & Database**:
  - [ ] MySQL 8.0 server is running on `localhost:3306`.
  - [ ] Database `planora_db` is active and accessible.

- [ ] **2. Backend Service (`BE/`)**:
  - [ ] Terminal open in `BE/` directory.
  - [ ] Command `npm run dev` executed successfully.
  - [ ] Terminal shows `Server running on port 5000`.

- [ ] **3. Frontend Application (`FE/`)**:
  - [ ] Terminal open in `FE/` directory.
  - [ ] Command `npm run dev` executed successfully.
  - [ ] Browser navigates cleanly to `http://localhost:5173`.

- [ ] **4. Liveness & Readiness Verification**:
  - [ ] `GET http://localhost:5000/api/health` returns `HTTP 200` (`Planora API is running`).
  - [ ] `GET http://localhost:5000/api/ready` returns `HTTP 200` (`database: connected`).

- [ ] **5. Demo Account & Data Audit**:
  - [ ] Demo account `demo@planora.vn` registered/verified.
  - [ ] Sample tasks (SWE201, DBI202, Slide đồ án) created.
  - [ ] Academic timetable slots entered for the active week.
  - [ ] 2-3 habit items created with initial check-in streaks visible.

- [ ] **6. Browser Environment**:
  - [ ] Browser developer console (F12) opened and cleared of errors.
  - [ ] Zoom level adjusted to 100% or 110% for projector readability.
  - [ ] Theme set to Light or Dark mode per presentation slide aesthetics.

- [ ] **7. AI Subsystem Check**:
  - [ ] Verified AI API status via `GET http://localhost:5000/api/ai/status`.
  - [ ] If using real AI: Internet connectivity verified and valid `AI_API_KEY` present in `BE/.env`.
  - [ ] If AI disabled: Confirmed safe fallback message displays cleanly on AI modals.

- [ ] **8. Presentation Slide Deck**:
  - [ ] Presentation slides (`PRESENTATION_OUTLINE.md`) opened in presentation mode.
  - [ ] Presenter notes and Q&A document (`DEFENSE_QA.md`) accessible on secondary screen or paper printout.

---

## 🆘 Fallback Demo Plan (If Live AI API is Unavailable)

If internet connectivity drops or external AI provider key expires during the presentation:

1. **Do NOT panic**. Planora features a built-in safe fallback architecture.
2. **Demonstrate Safe Mode**: Click "AI Ưu tiên công việc" or "AI Xếp lịch thông minh".
3. **Explain to Evaluators**:
   > *"Hệ thống Planora được thiết kế theo cơ chế Safe Fallback. Khi không có kết nối API ngoài hoặc AI bị tắt, hệ thống lập tức thông báo HTTP 503 một cách an toàn và bảo vệ toàn bộ dữ liệu. Các chức năng quản lý Công việc, Lịch, Thời khóa biểu, Thói quen và Dashboard vẫn hoạt động hoàn toàn bình thường mà không bị ảnh hưởng."*
4. **Continue Presentation**: Proceed with manual schedule entries, calendar filtering, habit check-ins, and dashboard analytics.
