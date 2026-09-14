# 🎬 Planora - Live Presentation & Demo Script (7-10 Minutes)

**Release Identifier**: Planora Core v1.0.0  
**Language**: Vietnamese (Kịch bản thuyết trình demo)

---

## ⏱️ Demo Overview

| Step | Time | Screen / Feature | Objective |
| :---: | :---: | :--- | :--- |
| **1** | 0:00 - 0:30 | Giới thiệu hệ thống | Tổng quan mục tiêu và giá trị của Planora |
| **2** | 0:30 - 1:00 | Đăng nhập (Login) | Đăng nhập tài khoản demo |
| **3** | 1:00 - 1:30 | Dashboard Tổng quan | Trình bày chỉ số năng suất và widgets |
| **4** | 1:30 - 2:15 | Quản lý Công việc (Tasks) | Tạo công việc mới với ưu tiên và deadline |
| **5** | 2:15 - 2:45 | Lịch cá nhân (Calendar) | Hiển thị công việc vừa tạo trên Lịch |
| **6** | 2:45 - 3:30 | Sự kiện (Events) | Tạo sự kiện lặp lại (Họp nhóm) |
| **7** | 3:30 - 4:15 | Thời khóa biểu (Timetable) | Trình bày lưới TKB môn học tuần |
| **8** | 4:15 - 4:45 | Thói quen (Habits) | Thực hiện Check-in thói quen hàng ngày |
| **9** | 4:45 - 5:15 | Cập nhật Dashboard | Minh họa chỉ số năng suất cập nhật realtime |
| **10** | 5:15 - 6:00 | AI Ưu tiên Công việc | Trình bày tính năng AI cố vấn ưu tiên |
| **11** | 6:00 - 7:00 | AI Xếp lịch Thông minh | Tìm khoảng trống & AI đề xuất lịch học |
| **12** | 7:00 - 7:30 | Xem trước Đề xuất AI | Trình bày bước duyệt lịch advisory |
| **13** | 7:30 - 8:00 | Xác nhận Áp dụng Lịch | Xác nhận chèn lịch vào CSDL nguyên tử |
| **14** | 8:00 - 8:30 | Kiểm tra Lịch cập nhật | Sự kiện tập trung hiển thị trực quan trên Lịch |
| **15** | 8:30 - 9:00 | Trợ lý AI (AI Assistant) | Hỏi đáp trực tiếp với Trợ lý Năng suất |
| **16** | 9:00 - 9:30 | Hồ sơ & Cài đặt | Chuyển đổi Giao diện Dark/Light & Cài đặt |
| **17** | 9:30 - 10:00 | Đăng xuất & Kết thúc | Kết thúc buổi demo sản phẩm |

---

## 📜 Detailed Step-by-Step Presentation Script

### Step 1: Giới thiệu Planora
- **Hành động**: Trình chiếu slide mở đầu hoặc màn hình Trang chủ `/login`.
- **Lời thoại**: "Kính chào Thầy/Cô và các bạn. Hôm nay nhóm em xin phép trình bày đồ án Planora - Hệ thống quản lý lịch trình và công việc cá nhân thông minh dành cho sinh viên và người đi làm."
- **Kết quả**: Tạo ấn tượng chuyên nghiệp ban đầu.

### Step 2: Đăng nhập (Login)
- **Hành động**: Nhập email `demo@planora.vn`, password `Password123!` và bấm "Đăng nhập".
- **Lời thoại**: "Hệ thống sử dụng xác thực JWT bảo mật với mật khẩu mã hóa bcrypt. Em xin đăng nhập vào tài khoản demo."
- **Kết quả**: Chuyển hướng thành công vào Dashboard `/dashboard`.

### Step 3: Tổng quan Dashboard
- **Hành động**: Di chuột qua các widget: Công việc hôm nay, Lịch học, Thói quen, và Điểm năng suất.
- **Lời thoại**: "Dashboard tổng hợp toàn bộ bức tranh làm việc trong ngày: danh sách bài tập, lịch học cố định, thói quen và điểm năng suất cập nhật realtime."
- **Kết quả**: Thể hiện giao diện hiện đại, tổng hợp thông tin trực quan.

### Step 4: Quản lý Công việc (Create Task)
- **Hành động**: Bấm "Tạo công việc", nhập tên `"Hoàn thành báo cáo SWE201"`, chọn độ ưu tiên `HIGH`, hạn chót ngày mai.
- **Lời thoại**: "Bây giờ em sẽ tạo một công việc mới. Hệ thống tự động tính toán trạng thái overdue dựa trên deadline và ngày hoàn thành."
- **Kết quả**: Công việc xuất hiện lập tức trên danh sách với tag màu ưu tiên.

### Step 5: Xem Công việc trên Lịch (Calendar View)
- **Hành động**: Chuyển sang tab "Lịch" (`/calendar`).
- **Lời thoại**: "Công việc vừa tạo được đồng bộ tự động lên lưới lịch tuần và tháng, giúp người dùng dễ dàng theo dõi deadline."
- **Kết quả**: Công việc hiển thị đúng mốc thời gian trên lịch.

### Step 6: Tạo Sự kiện cố định (Create Event)
- **Hành động**: Bấm "Tạo sự kiện", nhập `"Họp nhóm đồ án"`, thời gian 14:00 - 16:00.
- **Lời thoại**: "Ngoài công việc có deadline, người dùng có thể tạo các sự kiện cố định như họp nhóm hoặc seminar."
- **Kết quả**: Block sự kiện màu tím xuất hiện trên lịch.

### Step 7: Thời khóa biểu Học tập (Timetable)
- **Hành động**: Mở tab "Thời khóa biểu" (`/timetable`).
- **Lời thoại**: "Đây là Thời khóa biểu học tập 7 ngày. Mỗi môn học như SWE201 hay DBI202 được quản lý theo tiết học, phòng học và giảng viên."
- **Kết quả**: Lưới thời khóa biểu hiển thị trực quan các ca học trong tuần.

### Step 8: Theo dõi Thói quen (Habit Check-in)
- **Hành động**: Mở tab "Thói quen" (`/habits`), bấm nút "Check-in" cho thói quen `"Đọc sách 30 phút"`.
- **Lời thoại**: "Tính năng theo dõi thói quen giúp duy trì kỷ luật. Khi bấm check-in, chuỗi streak sẽ tự động tăng lên."
- **Kết quả**: Chuỗi streak tăng +1, biểu tượng lửa sáng lên.

### Step 9: Kiểm tra Cập nhật Dashboard
- **Hành động**: Quay lại Dashboard (`/dashboard`).
- **Lời thoại**: "Khi quay lại Dashboard, tỷ lệ hoàn thành thói quen và điểm năng suất đã được tự động tính toán lại."
- **Kết quả**: Điểm năng suất tăng lên trực quan.

### Step 10: AI Cố vấn Ưu tiên Công việc (AI Prioritization)
- **Hành động**: Bấm nút "AI Ưu tiên công việc".
- **Lời thoại**: "Khi có quá nhiều công việc, AI sẽ phân tích deadline và độ quan trọng để đưa ra gợi ý thứ tự xử lý tối ưu."
- **Kết quả**: Modal AI hiển thị danh sách xếp hạng công việc kèm lý do tư vấn.

### Step 11: AI Xếp lịch Smart Scheduling (Free-Slot Engine)
- **Hành động**: Mở tính năng "AI Xếp lịch thông minh".
- **Lời thoại**: "Đặc biệt, Planora kết hợp thuật toán tính khoảng trống lịch cố định với AI để đề xuất các ca tự học mà không gây trùng lịch."
- **Kết quả**: Thuật toán quét các khoảng trống giữa các ca học và sự kiện.

### Step 12: Xem trước Đề xuất AI (Preview Recommendation)
- **Hành động**: Trình bày bản xem trước các khung giờ tập trung do AI gợi ý.
- **Lời thoại**: "AI đóng vai trò cố vấn (Advisory). Hệ thống tuyệt đối KHÔNG tự ý sửa lịch nếu người dùng chưa xác nhận."
- **Kết quả**: Người dùng xem toàn bộ chi tiết khung giờ đề xuất trên modal.

### Step 13: Xác nhận Áp dụng Lịch (Explicit Apply)
- **Hành động**: Bấm nút "Áp dụng lịch".
- **Lời thoại**: "Khi người dùng bấm Áp dụng, backend sẽ revalidate và chèn lịch vào CSDL thông qua Prisma Transaction nguyên tử."
- **Kết quả**: Thông báo thành công hiển thị, các sự kiện tự học được lưu chính thức.

### Step 14: Kiểm tra Lịch sau khi Áp dụng AI
- **Hành động**: Chuyển sang màn hình Lịch (`/calendar`).
- **Lời thoại**: "Các block giờ tự học do AI đề xuất đã xuất hiện chính thức trên lịch biểu."
- **Kết quả**: Các sự kiện tự học mới hiển thị mượt mà trên lưới lịch.

### Step 15: Trợ lý AI (AI Productivity Assistant)
- **Hành động**: Mở khung chat Trợ lý AI, gõ câu hỏi: `"Làm sao để cân bằng giữa học tập và làm đồ án?"`.
- **Lời thoại**: "Trợ lý AI hỗ trợ giải đáp các thắc mắc về phương pháp quản lý thời gian và sắp xếp công việc."
- **Kết quả**: AI phản hồi câu trả lời súc tích, hữu ích.

### Step 16: Hồ sơ & Cài đặt Giao diện (Profile & Settings)
- **Hành động**: Vào màn hình Settings (`/settings`), đổi giao diện sang Dark Mode.
- **Lời thoại**: "Planora hỗ trợ tùy biến giao diện Light/Dark Mode linh hoạt cùng quản lý thông tin tín chỉ sinh viên."
- **Kết quả**: Toàn bộ ứng dụng chuyển sang giao diện tối mượt mà.

### Step 17: Đăng xuất & Kết thúc (Logout)
- **Hành động**: Bấm "Đăng xuất" (Logout).
- **Lời thoại**: "Em xin kết thúc phần demo sản phẩm Planora. Cảm ơn Thầy/Cô và các bạn đã lắng nghe!"
- **Kết quả**: Đăng xuất thành công, quay về màn hình Login.
