export const LANGUAGE_OPTIONS = [
  { id: 'vi', flag: '🇻🇳', nativeName: 'Tiếng Việt', displayName: 'Vietnamese', backendValue: 'VI' },
  { id: 'en', flag: '🇺🇸', nativeName: 'English', displayName: 'English', backendValue: 'EN' },
  { id: 'ja', flag: '🇯🇵', nativeName: '日本語', displayName: 'Japanese', backendValue: 'JA' },
  { id: 'ko', flag: '🇰🇷', nativeName: '한국어', displayName: 'Korean', backendValue: 'KO' },
  { id: 'zh', flag: '🇨🇳', nativeName: '中文', displayName: 'Chinese', backendValue: 'ZH' },
  { id: 'fr', flag: '🇫🇷', nativeName: 'Français', displayName: 'French', backendValue: 'FR' },
  { id: 'de', flag: '🇩🇪', nativeName: 'Deutsch', displayName: 'German', backendValue: 'DE' },
  { id: 'es', flag: '🇪🇸', nativeName: 'Español', displayName: 'Spanish', backendValue: 'ES' },
] as const;

export type AppLanguage = (typeof LANGUAGE_OPTIONS)[number]['id'];
export type BackendLanguage = (typeof LANGUAGE_OPTIONS)[number]['backendValue'];

const LANGUAGE_IDS = LANGUAGE_OPTIONS.map((language) => language.id);

export const normalizeLanguage = (language?: string | null): AppLanguage => {
  const normalized = language?.toLowerCase();
  return LANGUAGE_IDS.includes(normalized as AppLanguage) ? (normalized as AppLanguage) : 'vi';
};

export const toBackendLanguage = (language?: string | null): BackendLanguage => {
  const normalized = normalizeLanguage(language);
  return LANGUAGE_OPTIONS.find((item) => item.id === normalized)?.backendValue ?? 'VI';
};

export const fromBackendLanguage = (language?: string | null): AppLanguage => normalizeLanguage(language);

export type TranslationKey =
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.loading'
  | 'settings.error'
  | 'settings.tabs.general'
  | 'settings.tabs.notifications'
  | 'settings.tabs.security'
  | 'settings.tabs.appearance'
  | 'settings.general.title'
  | 'settings.general.subtitle'
  | 'settings.language.title'
  | 'settings.language.subtitle'
  | 'settings.language.current'
  | 'settings.autosave.title'
  | 'settings.autosave.subtitle'
  | 'settings.notifications.title'
  | 'settings.notifications.subtitle'
  | 'settings.notifications.email.title'
  | 'settings.notifications.email.subtitle'
  | 'settings.notifications.push.title'
  | 'settings.notifications.push.subtitle'
  | 'settings.notifications.deadline.title'
  | 'settings.notifications.deadline.subtitle'
  | 'settings.notifications.deadline.beforeHour'
  | 'settings.notifications.deadline.beforeHours'
  | 'settings.notifications.deadline.beforeDay'
  | 'settings.notifications.deadline.beforeDays'
  | 'settings.notifications.timetable.title'
  | 'settings.notifications.timetable.subtitle'
  | 'settings.notifications.sound.title'
  | 'settings.notifications.sound.subtitle'
  | 'settings.security.title'
  | 'settings.security.subtitle'
  | 'settings.security.password.title'
  | 'settings.security.password.current'
  | 'settings.security.password.new'
  | 'settings.security.password.confirm'
  | 'settings.security.password.update'
  | 'settings.security.password.success'
  | 'settings.security.password.error.currentRequired'
  | 'settings.security.password.error.minLength'
  | 'settings.security.password.error.mismatch'
  | 'settings.security.password.error.failed'
  | 'settings.security.twoFactor.title'
  | 'settings.security.twoFactor.subtitle'
  | 'settings.security.loginAlerts.title'
  | 'settings.security.loginAlerts.subtitle'
  | 'settings.appearance.title'
  | 'settings.appearance.subtitle'
  | 'settings.appearance.theme.title'
  | 'settings.appearance.theme.light'
  | 'settings.appearance.theme.dark'
  | 'sidebar.dashboard'
  | 'sidebar.calendar'
  | 'sidebar.timetable'
  | 'sidebar.tasks'
  | 'sidebar.assistant'
  | 'sidebar.goals'
  | 'sidebar.notes'
  | 'sidebar.reports'
  | 'sidebar.notifications'
  | 'sidebar.profile'
  | 'sidebar.settings'
  | 'sidebar.expand'
  | 'sidebar.collapse'
  | 'sidebar.pro.description'
  | 'header.search'
  | 'header.notifications'
  | 'tasks.title'
  | 'tasks.total'
  | 'tasks.inProgress'
  | 'tasks.completed'
  | 'tasks.overdue'
  | 'tasks.search'
  | 'tasks.aiPriority'
  | 'tasks.create'
  | 'tasks.filter.all'
  | 'tasks.filter.inProgress'
  | 'tasks.filter.completed'
  | 'tasks.filter.overdue'
  | 'tasks.priority.label'
  | 'tasks.priority.all'
  | 'tasks.priority.high'
  | 'tasks.priority.medium'
  | 'tasks.priority.low'
  | 'tasks.category.label'
  | 'tasks.empty.title'
  | 'tasks.empty.description'
  | 'tasks.modal.title'
  | 'tasks.modal.name'
  | 'tasks.modal.namePlaceholder'
  | 'tasks.modal.category'
  | 'tasks.modal.priority'
  | 'tasks.modal.dueDate'
  | 'tasks.modal.dueTime'
  | 'tasks.modal.courseCode'
  | 'tasks.modal.courseCodePlaceholder'
  | 'tasks.modal.description'
  | 'tasks.modal.descriptionPlaceholder'
  | 'tasks.modal.cancel'
  | 'tasks.modal.saving'
  | 'tasks.modal.save'
  | 'tasks.card.urgent'
  | 'tasks.card.high'
  | 'tasks.card.medium'
  | 'tasks.card.low'
  | 'tasks.card.due'
  | 'tasks.card.subtasks'
  | 'tasks.card.markIncomplete'
  | 'tasks.card.markComplete'
  | 'tasks.card.delete'
  | 'category.study'
  | 'category.work'
  | 'category.task'
  | 'category.meeting'
  | 'category.personal'
  | 'category.habit'
  | 'category.deadline'
  | 'assistant.badge'
  | 'assistant.title'
  | 'assistant.subtitle'
  | 'assistant.open'
  | 'assistant.prompt.today'
  | 'assistant.prompt.week'
  | 'assistant.prompt.breakdown'
  | 'goals.title'
  | 'goals.subtitle'
  | 'goals.averageProgress'
  | 'goals.addPlaceholder'
  | 'goals.add'
  | 'goals.progress'
  | 'goals.sample.one'
  | 'goals.sample.two'
  | 'goals.sample.three'
  | 'notes.title'
  | 'notes.subtitle'
  | 'notes.placeholder'
  | 'notes.save'
  | 'notes.sample.one'
  | 'notes.sample.two'
  | 'reports.title'
  | 'reports.subtitle'
  | 'reports.completedTasks'
  | 'reports.bestDay'
  | 'reports.activeGoals'
  | 'reports.weeklyScore'
  | 'assistant.panel.subtitle'
  | 'assistant.panel.welcome'
  | 'assistant.panel.thinking'
  | 'assistant.panel.suggestions'
  | 'assistant.panel.placeholder'
  | 'assistant.panel.tooLong'
  | 'assistant.panel.unavailable'
  | 'assistant.panel.prompt.one'
  | 'assistant.panel.prompt.two'
  | 'assistant.panel.prompt.three'
  | 'assistant.panel.prompt.four'
  | 'dashboard.hello'
  | 'dashboard.userFallback'
  | 'dashboard.today'
  | 'dashboard.summaryLine'
  | 'dashboard.assistant'
  | 'dashboard.aiSchedule'
  | 'dashboard.createTask'
  | 'dashboard.scheduleEvents'
  | 'dashboard.eventsNext7Days'
  | 'dashboard.todayTasks'
  | 'dashboard.completedPercent'
  | 'dashboard.overdueTasks'
  | 'dashboard.needsAction'
  | 'dashboard.noOverdue'
  | 'dashboard.habitsScore'
  | 'dashboard.score'
  | 'dashboard.todaySchedule'
  | 'dashboard.noScheduleToday'
  | 'dashboard.priorityTasks'
  | 'dashboard.todayAndOverdue'
  | 'dashboard.noPriorityTasks'
  | 'dashboard.viewAllTasks'
  | 'dashboard.todayHabits'
  | 'dashboard.completed'
  | 'dashboard.noHabits'
  | 'dashboard.itemsEvents'
  | 'dashboard.classPeriod'
  | 'dashboard.event'
  | 'dashboard.room'
  | 'dashboard.lecturer'
  | 'dashboard.allDay'
  | 'dashboard.done'
  | 'dashboard.dueToday'
  | 'dashboard.urgent'
  | 'dashboard.high'
  | 'dashboard.medium'
  | 'dashboard.low'
  | 'dashboard.habitFallback'
  | 'calendar.title'
  | 'calendar.week'
  | 'calendar.today'
  | 'calendar.previousWeek'
  | 'calendar.nextWeek'
  | 'calendar.monthYear'
  | 'calendar.day'
  | 'calendar.month'
  | 'calendar.newSchedule'
  | 'calendar.filterBy'
  | 'weekday.mon'
  | 'weekday.tue'
  | 'weekday.wed'
  | 'weekday.thu'
  | 'weekday.fri'
  | 'weekday.sat'
  | 'weekday.sun'
  | 'timetable.title'
  | 'timetable.subjects'
  | 'timetable.credits'
  | 'timetable.print'
  | 'timetable.export'
  | 'timetable.addSubject'
  | 'timetable.periodHeader'
  | 'timetable.period'
  | 'calendar.emptySlot'
  | 'calendar.rest'
  | 'weekday.monShort'
  | 'weekday.tueShort'
  | 'weekday.wedShort'
  | 'weekday.thuShort'
  | 'weekday.friShort'
  | 'weekday.satShort'
  | 'weekday.sunShort';

const translations: Record<AppLanguage, Partial<Record<TranslationKey, string>>> = {
  vi: {
    'settings.title': 'Cài đặt ứng dụng',
    'settings.subtitle': 'Tùy chỉnh thông báo, bảo mật và giao diện hiển thị cho tài khoản Planora của bạn.',
    'settings.loading': 'Đang tải cài đặt...',
    'settings.error': 'Đã xảy ra lỗi khi tải cài đặt. Vui lòng thử lại sau.',
    'settings.tabs.general': 'Cài đặt chung',
    'settings.tabs.notifications': 'Thông báo & Nhắc nhở',
    'settings.tabs.security': 'Bảo mật & Tài khoản',
    'settings.tabs.appearance': 'Giao diện & Chủ đề',
    'settings.general.title': 'Cài đặt hệ thống & Ngôn ngữ',
    'settings.general.subtitle': 'Quản lý ngôn ngữ hiển thị và hành vi mặc định của ứng dụng.',
    'settings.language.title': 'Ngôn ngữ hiển thị',
    'settings.language.subtitle': 'Chọn ngôn ngữ chính cho toàn bộ giao diện.',
    'settings.language.current': 'Đang dùng',
    'settings.autosave.title': 'Tự động lưu bản nháp',
    'settings.autosave.subtitle': 'Tự động lưu thông tin đang nhập trong biểu mẫu.',
    'settings.notifications.title': 'Cài đặt Thông báo & Nhắc nhở',
    'settings.notifications.subtitle': 'Tùy chỉnh thời điểm và phương thức nhận thông báo về lịch trình & deadline.',
    'settings.notifications.email.title': 'Thông báo qua Email',
    'settings.notifications.email.subtitle': 'Gửi tóm tắt lịch học và deadline đến email cá nhân',
    'settings.notifications.push.title': 'Thông báo trên trình duyệt (Push)',
    'settings.notifications.push.subtitle': 'Bật thông báo popup khi có nhiệm vụ sắp đến giờ',
    'settings.notifications.deadline.title': 'Thời gian nhắc nhở Deadline trước',
    'settings.notifications.deadline.subtitle': 'Gửi cảnh báo trước khi deadline hết hạn',
    'settings.notifications.deadline.beforeHour': 'Trước 1 giờ',
    'settings.notifications.deadline.beforeHours': 'Trước {hours} giờ',
    'settings.notifications.deadline.beforeDay': 'Trước 24 giờ (1 ngày)',
    'settings.notifications.deadline.beforeDays': 'Trước 48 giờ (2 ngày)',
    'settings.notifications.timetable.title': 'Nhắc nhở Thời khóa biểu',
    'settings.notifications.timetable.subtitle': 'Nhắc tiết học đầu tiên trong ngày vào lúc 06:30 sáng',
    'settings.notifications.sound.title': 'Âm thanh thông báo',
    'settings.notifications.sound.subtitle': 'Phát âm thanh nhẹ khi hoàn thành công việc hoặc có nhắc nhở',
    'settings.security.title': 'Bảo mật & Quản lý tài khoản',
    'settings.security.subtitle': 'Đổi mật khẩu và tăng cường bảo mật cho tài khoản cá nhân.',
    'settings.security.password.title': 'Đổi mật khẩu',
    'settings.security.password.current': 'Mật khẩu hiện tại',
    'settings.security.password.new': 'Mật khẩu mới',
    'settings.security.password.confirm': 'Xác nhận mật khẩu mới',
    'settings.security.password.update': 'Cập nhật mật khẩu',
    'settings.security.password.success': 'Đổi mật khẩu thành công!',
    'settings.security.password.error.currentRequired': 'Vui lòng nhập mật khẩu hiện tại',
    'settings.security.password.error.minLength': 'Mật khẩu mới phải có ít nhất 6 ký tự',
    'settings.security.password.error.mismatch': 'Mật khẩu xác nhận không khớp',
    'settings.security.password.error.failed': 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.',
    'settings.security.twoFactor.title': 'Xác thực 2 yếu tố (2FA)',
    'settings.security.twoFactor.subtitle': 'Yêu cầu mã xác thực OTP khi đăng nhập từ thiết bị mới',
    'settings.security.loginAlerts.title': 'Cảnh báo đăng nhập lạ',
    'settings.security.loginAlerts.subtitle': 'Gửi email cảnh báo khi có vị trí đăng nhập bất thường',
    'settings.appearance.title': 'Giao diện & Tùy biến chủ đề',
    'settings.appearance.subtitle': 'Tùy chọn chế độ màu sắc và phong cách hiển thị cho ứng dụng Planora.',
    'settings.appearance.theme.title': 'Chế độ giao diện (Theme)',
    'settings.appearance.theme.light': 'Giao diện Sáng',
    'settings.appearance.theme.dark': 'Giao diện Tối',
    'sidebar.dashboard': 'Tổng quan',
    'sidebar.calendar': 'Lịch của tôi',
    'sidebar.timetable': 'Thời khóa biểu',
    'sidebar.tasks': 'Công việc',
    'sidebar.assistant': 'Trợ lý AI',
    'sidebar.goals': 'Mục tiêu',
    'sidebar.notes': 'Ghi chú',
    'sidebar.reports': 'Báo cáo',
    'sidebar.notifications': 'Thông báo',
    'sidebar.profile': 'Hồ sơ cá nhân',
    'sidebar.settings': 'Cài đặt',
    'sidebar.expand': 'Mở rộng menu',
    'sidebar.collapse': 'Thu gọn menu',
    'sidebar.pro.description': 'Tự động tối ưu hóa lịch học & công việc của bạn.',
    'header.search': 'Tìm kiếm công việc, môn học, lịch trình...',
    'header.notifications': 'Thông báo',
    'tasks.title': 'Quản lý công việc & Deadline',
    'tasks.total': 'Nhiệm vụ',
    'tasks.inProgress': 'Đang làm',
    'tasks.completed': 'Hoàn thành',
    'tasks.overdue': 'Quá hạn',
    'tasks.search': 'Tìm kiếm công việc...',
    'tasks.aiPriority': 'Ưu tiên AI',
    'tasks.create': 'Tạo công việc mới',
    'tasks.filter.all': 'Tất cả',
    'tasks.filter.inProgress': 'Đang thực hiện',
    'tasks.filter.completed': 'Đã hoàn thành',
    'tasks.filter.overdue': 'Quá hạn',
    'tasks.priority.label': 'Độ ưu tiên',
    'tasks.priority.all': 'Tất cả mức độ',
    'tasks.priority.high': 'Gấp (Cao)',
    'tasks.priority.medium': 'Trung bình',
    'tasks.priority.low': 'Thấp',
    'tasks.category.label': 'Danh mục',
    'tasks.empty.title': 'Không tìm thấy công việc nào',
    'tasks.empty.description': 'Thử thay đổi bộ lọc hoặc tạo thêm công việc mới để quản lý dễ dàng hơn.',
    'tasks.modal.title': 'Tạo công việc / Deadline mới',
    'tasks.modal.name': 'Tên công việc / Hạn chót *',
    'tasks.modal.namePlaceholder': 'VD: Hoàn thành bài tập Lab 4',
    'tasks.modal.category': 'Danh mục',
    'tasks.modal.priority': 'Độ ưu tiên',
    'tasks.modal.dueDate': 'Ngày hết hạn *',
    'tasks.modal.dueTime': 'Giờ hết hạn',
    'tasks.modal.courseCode': 'Mã môn học liên quan (nếu có)',
    'tasks.modal.courseCodePlaceholder': 'VD: IT4010',
    'tasks.modal.description': 'Mô tả chi tiết',
    'tasks.modal.descriptionPlaceholder': 'Thêm chi tiết hoặc ghi chú bài tập...',
    'tasks.modal.cancel': 'Hủy bỏ',
    'tasks.modal.saving': 'Đang lưu...',
    'tasks.modal.save': 'Lưu công việc',
    'tasks.card.urgent': 'Khẩn cấp',
    'tasks.card.high': 'Gấp',
    'tasks.card.medium': 'Trung bình',
    'tasks.card.low': 'Thấp',
    'tasks.card.due': 'Hạn',
    'tasks.card.subtasks': 'việc con',
    'tasks.card.markIncomplete': 'Đánh dấu chưa hoàn thành',
    'tasks.card.markComplete': 'Đánh dấu hoàn thành',
    'tasks.card.delete': 'Xóa công việc',
    'category.study': 'Học tập',
    'category.work': 'Công việc',
    'category.task': 'Cần làm',
    'category.meeting': 'Cuộc họp',
    'category.personal': 'Cá nhân',
    'category.habit': 'Thói quen',
    'category.deadline': 'Deadline',
    'assistant.badge': 'Trợ lý năng suất',
    'assistant.title': 'Trợ lý AI Planora',
    'assistant.subtitle': 'Hỏi nhanh về lịch học, deadline, thứ tự ưu tiên và cách sắp xếp ngày làm việc.',
    'assistant.open': 'Mở trợ lý',
    'assistant.prompt.today': 'Hôm nay nên làm việc gì trước?',
    'assistant.prompt.week': 'Tạo lịch ôn tập cho tuần này',
    'assistant.prompt.breakdown': 'Gợi ý chia nhỏ công việc lớn',
    'goals.title': 'Mục tiêu',
    'goals.subtitle': 'Theo dõi các mục tiêu học tập, công việc và thói quen dài hạn.',
    'goals.averageProgress': 'Tiến độ trung bình',
    'goals.addPlaceholder': 'Thêm mục tiêu mới...',
    'goals.add': 'Thêm',
    'goals.progress': 'Tiến độ',
    'goals.sample.one': 'Hoàn thành 4 công việc quan trọng trong tuần',
    'goals.sample.two': 'Duy trì học tập 2 giờ mỗi ngày',
    'goals.sample.three': 'Không để task quá hạn',
    'notes.title': 'Ghi chú nhanh',
    'notes.subtitle': 'Lưu ý tưởng, việc cần nhớ và các đầu việc nhỏ chưa cần tạo task.',
    'notes.placeholder': 'Viết ghi chú...',
    'notes.save': 'Lưu',
    'notes.sample.one': 'Chuẩn bị tài liệu cho buổi học chiều nay',
    'notes.sample.two': 'Kiểm tra deadline bài tập nhóm',
    'reports.title': 'Báo cáo',
    'reports.subtitle': 'Tổng hợp nhanh nhịp làm việc và hiệu suất trong tuần.',
    'reports.completedTasks': 'Task hoàn thành',
    'reports.bestDay': 'Ngày tốt nhất',
    'reports.activeGoals': 'Mục tiêu đang chạy',
    'reports.weeklyScore': 'Điểm năng suất tuần',
    'assistant.panel.subtitle': 'Tư vấn năng suất & lịch học cá nhân',
    'assistant.panel.welcome': 'Xin chào! Tôi là Trợ lý AI Planora. Tôi có thể hỗ trợ bạn tư vấn thứ tự ưu tiên công việc, giải đáp lịch học và nhắc nhở hạn chót hôm nay.',
    'assistant.panel.thinking': 'Planora Assistant đang suy nghĩ...',
    'assistant.panel.suggestions': 'Gợi ý câu hỏi',
    'assistant.panel.placeholder': 'Hỏi Trợ lý Planora...',
    'assistant.panel.tooLong': 'Nội dung câu hỏi quá dài (tối đa 2000 ký tự).',
    'assistant.panel.unavailable': 'Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.',
    'assistant.panel.prompt.one': 'Hôm nay tôi nên ưu tiên làm gì trước?',
    'assistant.panel.prompt.two': 'Tuần này tôi có deadline nào gấp?',
    'assistant.panel.prompt.three': 'Lịch học hôm nay có bị trùng không?',
    'assistant.panel.prompt.four': 'Tại sao điểm năng suất hôm nay thấp?',
    'dashboard.hello': 'Xin chào',
    'dashboard.userFallback': 'Người dùng',
    'dashboard.today': 'Hôm nay',
    'dashboard.summaryLine': 'Bạn có {events} sự kiện sắp tới và {tasks} công việc cần thực hiện hôm nay.',
    'dashboard.assistant': 'Trợ lý AI',
    'dashboard.aiSchedule': 'Lập lịch AI',
    'dashboard.createTask': 'Tạo công việc',
    'dashboard.scheduleEvents': 'Lịch trình & Sự kiện',
    'dashboard.eventsNext7Days': 'Sự kiện trong 7 ngày tới',
    'dashboard.todayTasks': 'Công việc hôm nay',
    'dashboard.completedPercent': '{percent}% hoàn thành',
    'dashboard.overdueTasks': 'Công việc quá hạn',
    'dashboard.needsAction': 'Cần xử lý ngay',
    'dashboard.noOverdue': 'Không có việc quá hạn',
    'dashboard.habitsScore': 'Thói quen & Điểm Năng suất',
    'dashboard.score': 'Điểm',
    'dashboard.todaySchedule': 'Lịch trình hôm nay',
    'dashboard.noScheduleToday': 'Hôm nay bạn không có lịch học hoặc sự kiện nào.',
    'dashboard.priorityTasks': 'Công việc ưu tiên',
    'dashboard.todayAndOverdue': 'Hôm nay & Quá hạn',
    'dashboard.noPriorityTasks': 'Không có công việc nào cần làm hôm nay.',
    'dashboard.viewAllTasks': 'Xem tất cả danh sách công việc',
    'dashboard.todayHabits': 'Thói quen hôm nay',
    'dashboard.completed': 'hoàn thành',
    'dashboard.noHabits': 'Chưa có thói quen nào.',
    'dashboard.itemsEvents': 'tiết/sự kiện',
    'dashboard.classPeriod': 'Tiết học',
    'dashboard.event': 'Sự kiện',
    'dashboard.room': 'Phòng',
    'dashboard.lecturer': 'GV',
    'dashboard.allDay': 'Cả ngày',
    'dashboard.done': 'Đã xong',
    'dashboard.dueToday': 'Hạn hôm nay',
    'dashboard.urgent': 'Khẩn cấp',
    'dashboard.high': 'Cao',
    'dashboard.medium': 'Trung bình',
    'dashboard.low': 'Thấp',
    'dashboard.habitFallback': 'Thói quen',
    'calendar.title': 'Lịch của tôi',
    'calendar.week': 'Tuần',
    'calendar.today': 'Hôm nay',
    'calendar.previousWeek': 'Tuần trước',
    'calendar.nextWeek': 'Tuần tới',
    'calendar.monthYear': 'Tháng {month}, {year}',
    'calendar.day': 'Ngày',
    'calendar.month': 'Tháng',
    'calendar.newSchedule': 'Lên lịch mới',
    'calendar.filterBy': 'Lọc theo',
    'calendar.emptySlot': 'Khung giờ trống',
    'calendar.rest': 'Nghỉ ngơi',
    'weekday.mon': 'Thứ 2',
    'weekday.tue': 'Thứ 3',
    'weekday.wed': 'Thứ 4',
    'weekday.thu': 'Thứ 5',
    'weekday.fri': 'Thứ 6',
    'weekday.sat': 'Thứ 7',
    'weekday.sun': 'Chủ Nhật',
    'weekday.monShort': 'T2',
    'weekday.tueShort': 'T3',
    'weekday.wedShort': 'T4',
    'weekday.thuShort': 'T5',
    'weekday.friShort': 'T6',
    'weekday.satShort': 'T7',
    'weekday.sunShort': 'CN',
    'timetable.title': 'Thời khóa biểu học tập',
    'timetable.subjects': 'Môn học',
    'timetable.credits': 'Tín chỉ',
    'timetable.print': 'In TKB',
    'timetable.export': 'Xuất iCal',
    'timetable.addSubject': 'Thêm môn học',
    'timetable.periodHeader': 'Tiết học',
    'timetable.period': 'Tiết',
  },
  en: {
    'settings.title': 'App settings',
    'settings.subtitle': 'Customize notifications, security, and display preferences for your Planora account.',
    'settings.loading': 'Loading settings...',
    'settings.error': 'Could not load settings. Please try again later.',
    'settings.tabs.general': 'General settings',
    'settings.tabs.notifications': 'Notifications & reminders',
    'settings.tabs.security': 'Security & account',
    'settings.tabs.appearance': 'Appearance & theme',
    'settings.general.title': 'System & language settings',
    'settings.general.subtitle': 'Manage display language and default app behavior.',
    'settings.language.title': 'Display language',
    'settings.language.subtitle': 'Choose the main language for the interface.',
    'settings.language.current': 'Active',
    'settings.autosave.title': 'Auto-save drafts',
    'settings.autosave.subtitle': 'Automatically save information while you type in forms.',
    'settings.notifications.title': 'Notification & reminder settings',
    'settings.notifications.subtitle': 'Customize when and how you receive schedule and deadline alerts.',
    'settings.notifications.email.title': 'Email notifications',
    'settings.notifications.email.subtitle': 'Send study schedule and deadline summaries to your personal email',
    'settings.notifications.push.title': 'Browser notifications (Push)',
    'settings.notifications.push.subtitle': 'Show browser popups when tasks are coming up',
    'settings.notifications.deadline.title': 'Deadline reminder lead time',
    'settings.notifications.deadline.subtitle': 'Send alerts before deadlines expire',
    'settings.notifications.deadline.beforeHour': '1 hour before',
    'settings.notifications.deadline.beforeHours': '{hours} hours before',
    'settings.notifications.deadline.beforeDay': '24 hours before (1 day)',
    'settings.notifications.deadline.beforeDays': '48 hours before (2 days)',
    'settings.notifications.timetable.title': 'Timetable reminders',
    'settings.notifications.timetable.subtitle': 'Remind the first class of the day at 06:30 AM',
    'settings.notifications.sound.title': 'Notification sounds',
    'settings.notifications.sound.subtitle': 'Play a gentle sound when tasks are completed or reminders arrive',
    'settings.security.title': 'Security & account management',
    'settings.security.subtitle': 'Change your password and strengthen account security.',
    'settings.security.password.title': 'Change password',
    'settings.security.password.current': 'Current password',
    'settings.security.password.new': 'New password',
    'settings.security.password.confirm': 'Confirm new password',
    'settings.security.password.update': 'Update password',
    'settings.security.password.success': 'Password updated successfully!',
    'settings.security.password.error.currentRequired': 'Please enter your current password',
    'settings.security.password.error.minLength': 'New password must be at least 6 characters',
    'settings.security.password.error.mismatch': 'Password confirmation does not match',
    'settings.security.password.error.failed': 'Password change failed. Please check your current password.',
    'settings.security.twoFactor.title': 'Two-factor authentication (2FA)',
    'settings.security.twoFactor.subtitle': 'Require an OTP code when signing in from a new device',
    'settings.security.loginAlerts.title': 'Unusual login alerts',
    'settings.security.loginAlerts.subtitle': 'Send email alerts for unusual login locations',
    'settings.appearance.title': 'Appearance & theme customization',
    'settings.appearance.subtitle': 'Choose color mode and display style for Planora.',
    'settings.appearance.theme.title': 'Theme mode',
    'settings.appearance.theme.light': 'Light theme',
    'settings.appearance.theme.dark': 'Dark theme',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.calendar': 'My calendar',
    'sidebar.timetable': 'Timetable',
    'sidebar.tasks': 'Tasks',
    'sidebar.assistant': 'AI assistant',
    'sidebar.goals': 'Goals',
    'sidebar.notes': 'Notes',
    'sidebar.reports': 'Reports',
    'sidebar.notifications': 'Notifications',
    'sidebar.profile': 'Profile',
    'sidebar.settings': 'Settings',
    'sidebar.expand': 'Expand menu',
    'sidebar.collapse': 'Collapse menu',
    'sidebar.pro.description': 'Automatically optimize your study and work schedule.',
    'header.search': 'Search tasks, subjects, schedules...',
    'header.notifications': 'Notifications',
    'tasks.title': 'Task & deadline management',
    'tasks.total': 'Tasks',
    'tasks.inProgress': 'In progress',
    'tasks.completed': 'Completed',
    'tasks.overdue': 'Overdue',
    'tasks.search': 'Search tasks...',
    'tasks.aiPriority': 'AI priority',
    'tasks.create': 'Create new task',
    'tasks.filter.all': 'All',
    'tasks.filter.inProgress': 'In progress',
    'tasks.filter.completed': 'Completed',
    'tasks.filter.overdue': 'Overdue',
    'tasks.priority.label': 'Priority',
    'tasks.priority.all': 'All priorities',
    'tasks.priority.high': 'Urgent (High)',
    'tasks.priority.medium': 'Medium',
    'tasks.priority.low': 'Low',
    'tasks.category.label': 'Category',
    'tasks.empty.title': 'No tasks found',
    'tasks.empty.description': 'Try changing filters or create a new task to manage your work more easily.',
    'tasks.modal.title': 'Create new task / deadline',
    'tasks.modal.name': 'Task name / deadline *',
    'tasks.modal.namePlaceholder': 'Example: Finish Lab 4 assignment',
    'tasks.modal.category': 'Category',
    'tasks.modal.priority': 'Priority',
    'tasks.modal.dueDate': 'Due date *',
    'tasks.modal.dueTime': 'Due time',
    'tasks.modal.courseCode': 'Related course code (optional)',
    'tasks.modal.courseCodePlaceholder': 'Example: IT4010',
    'tasks.modal.description': 'Detailed description',
    'tasks.modal.descriptionPlaceholder': 'Add details or assignment notes...',
    'tasks.modal.cancel': 'Cancel',
    'tasks.modal.saving': 'Saving...',
    'tasks.modal.save': 'Save task',
    'tasks.card.urgent': 'Urgent',
    'tasks.card.high': 'High',
    'tasks.card.medium': 'Medium',
    'tasks.card.low': 'Low',
    'tasks.card.due': 'Due',
    'tasks.card.subtasks': 'subtasks',
    'tasks.card.markIncomplete': 'Mark as incomplete',
    'tasks.card.markComplete': 'Mark as complete',
    'tasks.card.delete': 'Delete task',
    'category.study': 'Study',
    'category.work': 'Work',
    'category.task': 'To-do',
    'category.meeting': 'Meeting',
    'category.personal': 'Personal',
    'category.habit': 'Habit',
    'category.deadline': 'Deadline',
    'assistant.badge': 'Productivity assistant',
    'assistant.title': 'Planora AI Assistant',
    'assistant.subtitle': 'Ask quickly about schedules, deadlines, priorities, and how to organize your workday.',
    'assistant.open': 'Open assistant',
    'assistant.prompt.today': 'What should I do first today?',
    'assistant.prompt.week': 'Create a study plan for this week',
    'assistant.prompt.breakdown': 'Suggest how to break down a big task',
    'goals.title': 'Goals',
    'goals.subtitle': 'Track long-term study, work, and habit goals.',
    'goals.averageProgress': 'Average progress',
    'goals.addPlaceholder': 'Add a new goal...',
    'goals.add': 'Add',
    'goals.progress': 'Progress',
    'goals.sample.one': 'Complete 4 important tasks this week',
    'goals.sample.two': 'Study 2 hours every day',
    'goals.sample.three': 'Avoid overdue tasks',
    'notes.title': 'Quick notes',
    'notes.subtitle': 'Save ideas, reminders, and small items that do not need a task yet.',
    'notes.placeholder': 'Write a note...',
    'notes.save': 'Save',
    'notes.sample.one': 'Prepare materials for this afternoon class',
    'notes.sample.two': 'Check the group assignment deadline',
    'reports.title': 'Reports',
    'reports.subtitle': 'Get a quick summary of your weekly work rhythm and performance.',
    'reports.completedTasks': 'Completed tasks',
    'reports.bestDay': 'Best day',
    'reports.activeGoals': 'Active goals',
    'reports.weeklyScore': 'Weekly productivity score',
    'assistant.panel.subtitle': 'Personal productivity & study planning',
    'assistant.panel.welcome': 'Hello! I am Planora AI Assistant. I can help you prioritize tasks, understand your study schedule, and keep track of today’s deadlines.',
    'assistant.panel.thinking': 'Planora Assistant is thinking...',
    'assistant.panel.suggestions': 'Suggested questions',
    'assistant.panel.placeholder': 'Ask Planora Assistant...',
    'assistant.panel.tooLong': 'Your question is too long (maximum 2000 characters).',
    'assistant.panel.unavailable': 'AI is currently unavailable. Please try again later.',
    'assistant.panel.prompt.one': 'What should I prioritize today?',
    'assistant.panel.prompt.two': 'Which deadlines are urgent this week?',
    'assistant.panel.prompt.three': 'Does today’s schedule have any conflicts?',
    'assistant.panel.prompt.four': 'Why is today’s productivity score low?',
    'dashboard.hello': 'Hello',
    'dashboard.userFallback': 'User',
    'dashboard.today': 'Today',
    'dashboard.summaryLine': 'You have {events} upcoming events and {tasks} tasks to complete today.',
    'dashboard.assistant': 'AI Assistant',
    'dashboard.aiSchedule': 'AI schedule',
    'dashboard.createTask': 'Create task',
    'dashboard.scheduleEvents': 'Schedule & events',
    'dashboard.eventsNext7Days': 'Events in the next 7 days',
    'dashboard.todayTasks': 'Today’s tasks',
    'dashboard.completedPercent': '{percent}% completed',
    'dashboard.overdueTasks': 'Overdue tasks',
    'dashboard.needsAction': 'Needs action',
    'dashboard.noOverdue': 'No overdue tasks',
    'dashboard.habitsScore': 'Habits & productivity score',
    'dashboard.score': 'Score',
    'dashboard.todaySchedule': 'Today’s schedule',
    'dashboard.noScheduleToday': 'You have no classes or events today.',
    'dashboard.priorityTasks': 'Priority tasks',
    'dashboard.todayAndOverdue': 'Today & overdue',
    'dashboard.noPriorityTasks': 'No tasks need to be done today.',
    'dashboard.viewAllTasks': 'View all tasks',
    'dashboard.todayHabits': 'Today’s habits',
    'dashboard.completed': 'completed',
    'dashboard.noHabits': 'No habits yet.',
    'dashboard.itemsEvents': 'items/events',
    'dashboard.classPeriod': 'Class period',
    'dashboard.event': 'Event',
    'dashboard.room': 'Room',
    'dashboard.lecturer': 'Teacher',
    'dashboard.allDay': 'All day',
    'dashboard.done': 'Done',
    'dashboard.dueToday': 'Due today',
    'dashboard.urgent': 'Urgent',
    'dashboard.high': 'High',
    'dashboard.medium': 'Medium',
    'dashboard.low': 'Low',
    'dashboard.habitFallback': 'Habit',
    'calendar.title': 'My calendar',
    'calendar.week': 'Week',
    'calendar.today': 'Today',
    'calendar.previousWeek': 'Previous week',
    'calendar.nextWeek': 'Next week',
    'calendar.monthYear': 'September, 2026',
    'calendar.day': 'Day',
    'calendar.month': 'Month',
    'calendar.newSchedule': 'New schedule',
    'calendar.filterBy': 'Filter by',
    'calendar.emptySlot': 'Free slot',
    'calendar.rest': 'Rest',
    'weekday.mon': 'Monday',
    'weekday.tue': 'Tuesday',
    'weekday.wed': 'Wednesday',
    'weekday.thu': 'Thursday',
    'weekday.fri': 'Friday',
    'weekday.sat': 'Saturday',
    'weekday.sun': 'Sunday',
    'weekday.monShort': 'Mon',
    'weekday.tueShort': 'Tue',
    'weekday.wedShort': 'Wed',
    'weekday.thuShort': 'Thu',
    'weekday.friShort': 'Fri',
    'weekday.satShort': 'Sat',
    'weekday.sunShort': 'Sun',
    'timetable.title': 'Study timetable',
    'timetable.subjects': 'Subjects',
    'timetable.credits': 'Credits',
    'timetable.print': 'Print',
    'timetable.export': 'Export iCal',
    'timetable.addSubject': 'Add subject',
    'timetable.periodHeader': 'Period',
    'timetable.period': 'Period',
  },
  ja: {
    'settings.title': 'アプリ設定',
    'settings.subtitle': 'Planora アカウントの通知、セキュリティ、表示を調整します。',
    'settings.loading': '設定を読み込み中...',
    'settings.error': '設定を読み込めませんでした。もう一度お試しください。',
    'settings.general.title': 'システムと言語',
    'settings.general.subtitle': '表示言語と既定の動作を管理します。',
    'settings.language.title': '表示言語',
    'settings.language.subtitle': '画面で使う主な言語を選択します。',
    'settings.language.current': '使用中',
    'settings.autosave.title': '下書きを自動保存',
    'settings.autosave.subtitle': 'フォーム入力中の内容を自動保存します。',
    'sidebar.dashboard': '概要',
    'sidebar.calendar': 'カレンダー',
    'sidebar.timetable': '時間割',
    'sidebar.tasks': 'タスク',
    'sidebar.assistant': 'AI アシスタント',
    'sidebar.goals': '目標',
    'sidebar.notes': 'メモ',
    'sidebar.reports': 'レポート',
    'sidebar.notifications': '通知',
    'sidebar.profile': 'プロフィール',
    'sidebar.settings': '設定',
    'sidebar.expand': 'メニューを開く',
    'sidebar.collapse': 'メニューを閉じる',
    'sidebar.pro.description': '学習と仕事の予定を自動で最適化します。',
    'header.search': 'タスク、科目、予定を検索...',
    'header.notifications': '通知',
  },
  ko: {
    'settings.title': '앱 설정',
    'settings.subtitle': 'Planora 계정의 알림, 보안, 화면 표시를 설정합니다.',
    'settings.loading': '설정을 불러오는 중...',
    'settings.error': '설정을 불러오지 못했습니다. 다시 시도해 주세요.',
    'settings.general.title': '시스템 및 언어 설정',
    'settings.general.subtitle': '표시 언어와 기본 동작을 관리합니다.',
    'settings.language.title': '표시 언어',
    'settings.language.subtitle': '인터페이스에 사용할 기본 언어를 선택하세요.',
    'settings.language.current': '사용 중',
    'settings.autosave.title': '초안 자동 저장',
    'settings.autosave.subtitle': '양식에 입력 중인 정보를 자동으로 저장합니다.',
    'sidebar.dashboard': '대시보드',
    'sidebar.calendar': '내 캘린더',
    'sidebar.timetable': '시간표',
    'sidebar.tasks': '작업',
    'sidebar.assistant': 'AI 도우미',
    'sidebar.goals': '목표',
    'sidebar.notes': '노트',
    'sidebar.reports': '보고서',
    'sidebar.profile': '프로필',
    'sidebar.settings': '설정',
    'sidebar.expand': '메뉴 펼치기',
    'sidebar.collapse': '메뉴 접기',
    'sidebar.pro.description': '학습과 업무 일정을 자동으로 최적화합니다.',
    'header.search': '작업, 과목, 일정을 검색...',
    'header.notifications': '알림',
  },
  zh: {
    'settings.title': '应用设置',
    'settings.subtitle': '自定义 Planora 账户的通知、安全和显示偏好。',
    'settings.loading': '正在加载设置...',
    'settings.error': '无法加载设置，请稍后再试。',
    'settings.general.title': '系统与语言设置',
    'settings.general.subtitle': '管理显示语言和应用默认行为。',
    'settings.language.title': '显示语言',
    'settings.language.subtitle': '选择界面使用的主要语言。',
    'settings.language.current': '当前使用',
    'settings.autosave.title': '自动保存草稿',
    'settings.autosave.subtitle': '在表单输入时自动保存内容。',
    'sidebar.dashboard': '总览',
    'sidebar.calendar': '我的日历',
    'sidebar.timetable': '课程表',
    'sidebar.tasks': '任务',
    'sidebar.assistant': 'AI 助手',
    'sidebar.goals': '目标',
    'sidebar.notes': '笔记',
    'sidebar.reports': '报告',
    'sidebar.profile': '个人资料',
    'sidebar.settings': '设置',
    'sidebar.expand': '展开菜单',
    'sidebar.collapse': '收起菜单',
    'sidebar.pro.description': '自动优化你的学习和工作日程。',
    'header.search': '搜索任务、科目、日程...',
    'header.notifications': '通知',
  },
  fr: {
    'settings.title': 'Paramètres de l’application',
    'settings.subtitle': 'Personnalisez les notifications, la sécurité et l’affichage de votre compte Planora.',
    'settings.loading': 'Chargement des paramètres...',
    'settings.error': 'Impossible de charger les paramètres. Veuillez réessayer.',
    'settings.general.title': 'Système et langue',
    'settings.general.subtitle': 'Gérez la langue d’affichage et le comportement par défaut.',
    'settings.language.title': 'Langue d’affichage',
    'settings.language.subtitle': 'Choisissez la langue principale de l’interface.',
    'settings.language.current': 'Active',
    'settings.autosave.title': 'Enregistrement automatique',
    'settings.autosave.subtitle': 'Enregistre automatiquement les informations saisies dans les formulaires.',
    'sidebar.dashboard': 'Tableau de bord',
    'sidebar.calendar': 'Mon calendrier',
    'sidebar.timetable': 'Emploi du temps',
    'sidebar.tasks': 'Tâches',
    'sidebar.assistant': 'Assistant IA',
    'sidebar.goals': 'Objectifs',
    'sidebar.notes': 'Notes',
    'sidebar.reports': 'Rapports',
    'sidebar.profile': 'Profil',
    'sidebar.settings': 'Paramètres',
    'sidebar.expand': 'Développer le menu',
    'sidebar.collapse': 'Réduire le menu',
    'sidebar.pro.description': 'Optimisez automatiquement votre planning d’étude et de travail.',
    'header.search': 'Rechercher tâches, matières, horaires...',
    'header.notifications': 'Notifications',
  },
  de: {
    'settings.title': 'App-Einstellungen',
    'settings.subtitle': 'Passe Benachrichtigungen, Sicherheit und Anzeige für dein Planora-Konto an.',
    'settings.loading': 'Einstellungen werden geladen...',
    'settings.error': 'Einstellungen konnten nicht geladen werden. Bitte erneut versuchen.',
    'settings.general.title': 'System und Sprache',
    'settings.general.subtitle': 'Verwalte Anzeigesprache und Standardverhalten der App.',
    'settings.language.title': 'Anzeigesprache',
    'settings.language.subtitle': 'Wähle die Hauptsprache der Oberfläche.',
    'settings.language.current': 'Aktiv',
    'settings.autosave.title': 'Entwürfe automatisch speichern',
    'settings.autosave.subtitle': 'Speichert Eingaben in Formularen automatisch.',
    'sidebar.dashboard': 'Übersicht',
    'sidebar.calendar': 'Mein Kalender',
    'sidebar.timetable': 'Stundenplan',
    'sidebar.tasks': 'Aufgaben',
    'sidebar.assistant': 'KI-Assistent',
    'sidebar.goals': 'Ziele',
    'sidebar.notes': 'Notizen',
    'sidebar.reports': 'Berichte',
    'sidebar.profile': 'Profil',
    'sidebar.settings': 'Einstellungen',
    'sidebar.expand': 'Menü öffnen',
    'sidebar.collapse': 'Menü schließen',
    'sidebar.pro.description': 'Optimiere automatisch deinen Lern- und Arbeitsplan.',
    'header.search': 'Aufgaben, Fächer, Termine suchen...',
    'header.notifications': 'Benachrichtigungen',
  },
  es: {
    'settings.title': 'Configuración de la app',
    'settings.subtitle': 'Personaliza notificaciones, seguridad y visualización de tu cuenta Planora.',
    'settings.loading': 'Cargando configuración...',
    'settings.error': 'No se pudo cargar la configuración. Inténtalo de nuevo.',
    'settings.general.title': 'Sistema e idioma',
    'settings.general.subtitle': 'Gestiona el idioma de visualización y el comportamiento predeterminado.',
    'settings.language.title': 'Idioma de visualización',
    'settings.language.subtitle': 'Elige el idioma principal de la interfaz.',
    'settings.language.current': 'Activo',
    'settings.autosave.title': 'Guardar borradores automáticamente',
    'settings.autosave.subtitle': 'Guarda automáticamente la información mientras escribes en formularios.',
    'sidebar.dashboard': 'Resumen',
    'sidebar.calendar': 'Mi calendario',
    'sidebar.timetable': 'Horario',
    'sidebar.tasks': 'Tareas',
    'sidebar.assistant': 'Asistente IA',
    'sidebar.goals': 'Objetivos',
    'sidebar.notes': 'Notas',
    'sidebar.reports': 'Informes',
    'sidebar.profile': 'Perfil',
    'sidebar.settings': 'Configuración',
    'sidebar.expand': 'Expandir menú',
    'sidebar.collapse': 'Contraer menú',
    'sidebar.pro.description': 'Optimiza automáticamente tu horario de estudio y trabajo.',
    'header.search': 'Buscar tareas, materias, horarios...',
    'header.notifications': 'Notificaciones',
  },
};

export const translate = (language: string | null | undefined, key: TranslationKey): string => {
  const normalized = normalizeLanguage(language);
  return translations[normalized][key] ?? translations.en[key] ?? translations.vi[key] ?? key;
};





