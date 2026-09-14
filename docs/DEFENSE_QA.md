# 🎓 Planora - Lecturer Defense Questions & Answers (Q&A)

**Release Identifier**: Planora Core v1.0.0  

This document contains 32 comprehensive defense questions and technical answers designed for academic project evaluation.

---

## 🏛️ Section 1: Architecture & Technology Choices

### Q1: Tại sao dự án chọn React 18 thay vì HTML/JS thuần hay Angular/Vue?
**Trả lời**: React 18 sở hữu cơ chế Virtual DOM tối ưu, mô hình Component tái sử dụng cao và hệ sinh thái phong phú (React Query, Zustand). Đối với ứng dụng cập nhật giao diện liên tục như Lịch và Dashboard, React 18 giúp quản lý state hiệu quả và tối ưu hiệu năng rendering.

### Q2: Tại sao sử dụng TypeScript trên cả Frontend và Backend?
**Trả lời**: TypeScript cung cấp static type checking giúp phát hiện lỗi ngay từ thời điểm biên dịch (compile-time), ngăn ngừa các lỗi `NullPointerException` hoặc `undefined` phổ biến. Đồng thời, TypeScript cho phép chia sẻ type definitions (như DTOs, Zod Schemas) giữa FE và BE.

### Q3: Tại sao lựa chọn Node.js và Express làm Backend framework?
**Trả lời**: Node.js sử dụng kiến trúc bất đồng bộ (Non-blocking I/O, Event Loop) thích hợp xử lý hàng ngàn request đồng thời với dung lượng bộ nhớ nhẹ. Express là micro-framework tối giản, linh hoạt trong việc tích hợp middleware kiểm tra xác thực và Zod validation.

### Q4: Tại sao sử dụng Prisma ORM thay vì viết SQL thuần hay TypeORM?
**Trả lời**: Prisma cung cấp Auto-generated Type Safety 100% dựa trên schema. Prisma Migration giúp quản lý phiên bản CSDL nhất quán, đồng thời tính năng `$transaction` hỗ trợ thực thi các thao tác nguyên tử (atomic operations) dễ dàng.

### Q5: Tại sao dự án chọn MySQL 8.0?
**Trả lời**: MySQL 8.0 là CSDL quan hệ chuẩn mực, ổn định, hỗ trợ giao tác ACID đầy đủ, chỉ mục B-Tree hiệu năng cao và chuẩn mã hóa `utf8mb4` hỗ trợ tiếng Việt toàn diện.

### Q6: Tại sao lại dùng CẢ Zustand VÀ TanStack Query (React Query)?
**Trả lời**: Dự án phân định rõ ràng giữa **Client State** và **Server State**:
- **Zustand**: Quản lý Client State nhẹ, volatile (trạng thái mở modal, theme, JWT token trong bộ nhớ).
- **TanStack Query**: Quản lý Server State (caching, background refetching, deduplication request, tự động xoá cache khi mutation thành công).

### Q7: Tại sao sử dụng JWT (JSON Web Token) cho xác thực?
**Trả lời**: JWT cho phép xác thực phi trạng thái (Stateless), backend không cần truy vấn CSDL hoặc Redis để kiểm tra session ở mỗi request. Client chỉ cần gửi Bearer Token trong header.

### Q8: Tại sao lại chọn `bcryptjs` để mã hóa mật khẩu?
**Trả lời**: Bcrypt tích hợp thuật toán Key Derivation Function với cơ chế Salt tự động và Work Factor (10 rounds). Điều này chống lại các cuộc tấn công Rainbow Table và Brute Force hiệu quả.

### Q9: Tại sao dùng Zod cho việc validate dữ liệu?
**Trả lời**: Zod cho phép định nghĩa schema validation bằng TypeScript code, tự động suy luận (infer) ra static type. Zod validate dữ liệu ngay tại middleware trước khi request đi vào Controller.

### Q10: Tại sao cấu trúc Frontend theo Feature-based (`src/features/`) thay vì Layer-based (`components/`, `views/`)?
**Trả lời**: Kiến trúc Feature-based gom nhóm tất cả UI component, custom hooks, API calls và types liên quan đến một miền nghiệp vụ (như `tasks/`, `events/`, `habits/`) vào một thư mục. Điều này giúp dự án dễ bảo trì và mở rộng khi quy mô tăng lên.

### Q11: Tại sao không gọi API trực tiếp trong các Component mà qua Custom Hooks / API client?
**Trả lời**: Việc tách API client và custom hooks tuân thủ nguyên lý **Single Responsibility Principle (SRP)**. Component chỉ tập trung render UI, logic lấy dữ liệu và cache được đóng gói trong hooks giúp tái sử dụng và dễ dàng viết unit test.

---

## 🔒 Section 2: Security & Business Logic Implementation

### Q12: Làm thế nào để hệ thống ngăn chặn User A truy cập hoặc sửa dữ liệu của User B?
**Trả lời**: Mọi truy vấn CSDL đều bắt buộc kèm theo điều kiện lọc `userId` trích xuất từ JWT token đã được xác thực qua middleware:
```typescript
const task = await prisma.task.findFirst({
  where: { id: taskId, userId: req.user.id }
});
```
Nếu không tìm thấy bản ghi khớp với cả `id` và `userId`, backend lập tức trả về HTTP 404/403.

### Q13: Trạng thái Overdue (quá hạn) của Task được tính toán như thế nào?
**Trả lời**: Overdue không lưu cứng độc lập mà được tính toán động: Nếu `status !== 'COMPLETED'` VÀ `dueDate < NOW()`, hệ thống xác định trạng thái hiển thị là `OVERDUE`.

### Q14: Cơ chế sự kiện lặp lại (Recurring Events) được triển khai ra sao?
**Trả lời**: Bảng `Event` lưu `recurrenceType` (DAILY, WEEKLY, MONTHLY, YEARLY) và `recurrenceInterval`. Khi client truy vấn lịch theo khoảng thời gian, backend/frontend sẽ tự động tính toán các mốc thời gian lặp lại dựa trên thuật toán mở rộng chuỗi thời gian mà không cần nhân bản vô số bản ghi vào CSDL.

### Q15: Thuật toán ánh xạ Thời khóa biểu (Timetable) sang tuần làm việc như thế nào?
**Trả lời**: Mỗi `TimetableItem` chứa `dayOfWeek` (0 = Thứ 2 đến 6 = Chủ Nhật) và `startSlot` (Tiết 1-10). Hệ thống lấy ngày đầu tuần (Monday) của tuần hiện tại, cộng số ngày tương ứng với `dayOfWeek` và ghép với giờ bắt đầu/kết thúc của tiết học.

### Q16: Chuỗi thói quen (Habit Streak) được tính toán như thế nào?
**Trả lời**: Khi người dùng check-in, hệ thống ghi bản ghi vào `HabitLog` với `completedDate`. Backend kiểm tra khoảng cách giữa ngày check-in hôm nay và `lastCompletedDate`. Nếu là 2 ngày liên tiếp, `currentStreak` tăng +1; nếu ngắt quãng quá 1 ngày, `currentStreak` reset về 1. `bestStreak` luôn lưu giá trị lớn nhất từng đạt được.

### Q17: Tại sao lại thêm trường `completedAt` vào bảng Task?
**Trả lời**: `completedAt` ghi lại chính xác mốc thời gian người dùng hoàn thành công việc. Trường này dùng để đánh giá hoàn thành đúng hạn hay trễ hạn, đồng thời phục vụ báo cáo thống kê năng suất tuần/tháng trên Dashboard.

### Q18: Điểm năng suất (Productivity Score) trên Dashboard hoạt động như thế nào?
**Trả lời**: Điểm năng suất được tổng hợp từ 3 chỉ số weighted: (1) Tỷ lệ hoàn thành công việc đúng hạn (50%), (2) Tỷ lệ duy trì streak thói quen (30%), và (3) Tỷ lệ tham gia sự kiện/lịch học (20%).

---

## 🤖 Section 3: AI Smart Scheduling & Safeguards

### Q19: Thuật toán AI xếp lịch tự động hoạt động như thế nào?
**Trả lời**: Thuật toán gồm 2 bước:
1. **Free-Slot Engine (TypeScript)**: Quét CSDL lấy toàn bộ sự kiện và thời khóa biểu trong ngày, tính toán chính xác các khoảng thời gian trống không bị trùng.
2. **AI Advisory (LLM)**: Truyền danh sách khoảng trống và danh sách task cần làm cho LLM để phân xếp các ca học vào khoảng trống thích hợp nhất.

### Q20: Tại sao không để AI tự tạo và chèn lịch trực tiếp vào CSDL?
**Trả lời**: Để đảm bảo tính tin cậy tuyệt đối (100% no-hallucination). LLM có thể sinh ra mốc thời gian không tồn tại hoặc gây trùng lịch. Việc tính khoảng trống do mã TypeScript đảm nhận, AI chỉ đóng vai trò cố vấn và bắt buộc người dùng bấm xác nhận.

### Q21: Làm thế nào để chống hiện tượng AI Hallucination (ảo giác)?
**Trả lời**: Bằng cách giới hạn không gian sinh của AI: Không cho AI tự tính toán ngày giờ, mà cấp sẵn cho AI danh sách khung giờ hợp lệ dưới dạng JSON struct.

### Q22: Điều gì xảy ra khi dịch vụ AI bị gián đoạn hoặc hết API key?
**Trả lời**: Hệ thống hoạt động theo cơ chế **Safe Fallback**: Khi `AI_PROVIDER=none` hoặc API lỗi, backend trả về HTTP 503 kèm thông báo hướng dẫn. Toàn bộ tính năng cốt lõi (Task, Lịch, TKB, Thói quen, Dashboard) vẫn hoạt động 100% bình thường.

### Q23: API Key của AI được bảo vệ như thế nào?
**Trả lời**: Key được lưu trong biến môi trường `.env` trên backend. Client tuyệt đối không có quyền tiếp cận API Key. Mọi yêu cầu gọi AI đều đi qua proxy endpoint của backend Express.

### Q24: Prompt Injection là gì và Planora phòng chống ra sao?
**Trả lời**: Prompt Injection là việc người dùng cố tình nhập văn bản chứa câu lệnh để lừa LLM bỏ qua rào cản hệ thống. Planora sanitizes đầu vào và bọc dữ liệu người dùng trong các thẻ cấu trúc XML/JSON cứng kèm chỉ thị system prompt nghiêm ngặt.

---

## 🐳 Section 4: DevOps, Data & Limitations

### Q25: Tại sao dự án sử dụng Docker và Docker Compose?
**Trả lời**: Docker đảm bảo tính đóng gói (Containerization), giúp ứng dụng chạy nhất quán trên mọi môi trường (Local, Staging, Production) mà không bị lỗi khác biệt phiên bản Node/MySQL.

### Q26: Lệnh `npx prisma migrate deploy` khác gì với `prisma migrate dev`?
**Trả lời**: `prisma migrate dev` dùng cho môi trường phát triển (tự động tạo file migration mới và có thể reset DB). `prisma migrate deploy` chỉ dùng cho production để áp dụng các file SQL migration đã kiểm thử vào CSDL mà không làm mất dữ liệu.

### Q27: Dự án xử lý tiếng Việt (UTF-8) như thế nào để không bị lỗi font?
**Trả lời**: CSDL MySQL được tạo với mã hóa `utf8mb4_unicode_ci`. Express hỗ trợ JSON UTF-8 mặc định, và Frontend cài đặt meta charset UTF-8 cùng font chữInter/Roboto hỗ trợ tiếng Việt hoàn hảo.

### Q28: Hạn chế hiện tại của hệ thống là gì?
**Trả lời**: (1) Cơ chế Logout JWT là client-side (chưa dùng Redis blacklist token), (2) Tính năng AI phụ thuộc vào kết nối API bên ngoài, (3) Chưa có ứng dụng Native trên thiết bị di động.

---

## 🔬 Section 5: Advanced Technical Deep-Dive

### Q29: Điều gì xảy ra khi Token JWT hết hạn?
**Trả lời**: Axios interceptor ở Frontend phát hiện response trả về HTTP 401 Unauthorized, lập tức xóa token khỏi Zustand store và tự động chuyển hướng người dùng về trang `/login`.

### Q30: Xử lý thế nào nếu 2 request áp dụng lịch AI (`/ai/schedule/apply`) diễn ra đồng thời?
**Trả lời**: Backend bọc toàn bộ thao tác kiểm tra và ghi bản ghi trong một khối `prisma.$transaction`. Nếu có xung đột dữ liệu giữa 2 giao tác, giao tác sau sẽ bị abort và rollback tự động để tránh ghi đè dữ liệu.

### Q31: Sự khác biệt giữa Client State và Server State trong ứng dụng?
**Trả lời**: Client State là dữ liệu tạm thời trên trình duyệt (đóng/mở sidebar, theme). Server State là dữ liệu gốc lưu ở CSDL backend (danh sách công việc, lịch). TanStack Query giúp đồng bộ Server State về Client với cơ chế caching thông minh.

### Q32: Tại sao HabitLog lại tốt hơn việc chỉ lưu trường `isCompletedToday` trên bảng Habit?
**Trả lời**: Lưu `isCompletedToday` chỉ cho biết trạng thái ngày hiện tại và sẽ bị ghi đè mỗi ngày. Bảng `HabitLog` lưu trữ lịch sử check-in theo từng ngày cụ thể (`completedDate`), giúp truy vấn báo cáo thống kê chuỗi streak chính xác theo mốc thời gian quá khứ.
