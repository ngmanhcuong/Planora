export interface MetricSummary {
  todayScheduleCount: number;
  nextScheduleTime: string;
  completedTasks: number;
  totalTasks: number;
  upcomingDeadlinesCount: number;
  deadlineNotice: string;
  habitStreakDays: number;
  streakStatus: string;
}

export interface TimelineEvent {
  id: string;
  timeRange: string;
  category: 'study' | 'work' | 'task' | 'meeting' | 'personal' | 'habit' | 'deadline';
  categoryLabel: string;
  title: string;
  subtitle?: string;
  borderColor: string;
  location?: string;
  speaker?: string;
  participantsCount?: number;
  meetUrl?: string;
  isUrgent?: boolean;
  statusText?: string;
}

export interface TimelineGap {
  id: string;
  timeRange: string;
  durationText: string;
  title: string;
  badgeText?: string;
  type: 'rest' | 'lunch' | 'focus';
}

export interface PriorityTask {
  id: string;
  title: string;
  dueTimeText: string;
  priorityText: string;
  priorityLevel: 'high' | 'medium' | 'low';
  estimatedHours?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  description: string;
  streakDays: number;
  isCompleted: boolean;
}

export interface TomorrowEvent {
  id: string;
  title: string;
  timeRange: string;
  location: string;
  color: string;
}

export const MOCK_DASHBOARD_METRICS: MetricSummary = {
  todayScheduleCount: 5,
  nextScheduleTime: '08:00',
  completedTasks: 3,
  totalTasks: 6,
  upcomingDeadlinesCount: 2,
  deadlineNotice: 'Trước 12:00 trưa',
  habitStreakDays: 7,
  streakStatus: 'Duy trì xuất sắc',
};

export const MOCK_TIMELINE_ITEMS: (TimelineEvent | TimelineGap)[] = [
  {
    id: 'evt_1',
    timeRange: '08:00 – 09:30',
    category: 'study',
    categoryLabel: 'Học tập',
    title: 'Software Testing & Quality Assurance',
    borderColor: '#2170e4',
    location: 'Phòng A203 (Cơ sở 1)',
    speaker: 'ThS. Hoàng Long',
  },
  {
    id: 'gap_1',
    timeRange: '09:30 - 10:00',
    durationText: '30 phút',
    title: 'Nghỉ giữa giờ & chuẩn bị tài liệu',
    type: 'rest',
  },
  {
    id: 'evt_2',
    timeRange: '10:00 – 11:30',
    category: 'deadline',
    categoryLabel: 'Sắp đến hạn',
    title: 'Hoàn thành Test Case & Báo cáo đồ án',
    subtitle: 'Tổng hợp kết quả kiểm thử unit test cho module Đặt hàng và gửi file zip lên cổng portal sinh viên.',
    borderColor: '#ba1a1a',
    isUrgent: true,
    statusText: 'Deadline 12:00',
  },
  {
    id: 'gap_2',
    timeRange: '11:30 - 13:30',
    durationText: '2 giờ',
    title: 'Khoảng trống: Nghỉ trưa & Ăn uống',
    type: 'lunch',
  },
  {
    id: 'evt_3',
    timeRange: '13:30 – 14:30',
    category: 'meeting',
    categoryLabel: 'Cuộc họp',
    title: 'Họp nhóm đồ án tốt nghiệp',
    borderColor: '#4f46e5',
    location: 'Google Meet / Phòng Lab 3',
    participantsCount: 5,
    meetUrl: 'https://meet.google.com',
  },
  {
    id: 'gap_3',
    timeRange: '14:30 - 17:30',
    durationText: '3 giờ',
    title: 'Trống 3 giờ • Lý tưởng cho phiên tự học Deep Work',
    type: 'focus',
  },
  {
    id: 'evt_4',
    timeRange: '17:30 – 18:00',
    category: 'habit',
    categoryLabel: 'Thói quen',
    title: 'Chạy bộ rèn luyện sức khỏe 30 phút',
    borderColor: '#006e4b',
    location: 'Mục tiêu: 3.5 km quanh công viên',
    statusText: 'Chưa check-in',
  },
];

export const MOCK_PRIORITY_TASKS: PriorityTask[] = [
  {
    id: 'task_1',
    title: 'Hoàn thành Test Case đồ án',
    dueTimeText: 'Hạn 12:00',
    priorityText: 'Ưu tiên cao',
    priorityLevel: 'high',
    estimatedHours: '2 giờ',
    isCompleted: false,
  },
  {
    id: 'task_2',
    title: 'Gửi slides thuyết trình cho GV',
    dueTimeText: 'Hôm nay 18:00',
    priorityText: 'Ưu tiên trung bình',
    priorityLevel: 'medium',
    isCompleted: false,
  },
  {
    id: 'task_3',
    title: 'Đọc trước Chương 4 tài liệu kiểm thử',
    dueTimeText: 'Đã xong lúc 07:15',
    priorityText: 'Đã xong',
    priorityLevel: 'low',
    isCompleted: true,
    completedAt: '07:15',
  },
];

export const MOCK_HABITS: HabitItem[] = [
  {
    id: 'habit_1',
    title: 'Học tiếng Nhật',
    description: '30 phút mỗi ngày • Từ vựng N3',
    streakDays: 7,
    isCompleted: true,
  },
  {
    id: 'habit_2',
    title: 'Đọc sách phát triển',
    description: '20 phút mỗi ngày • Atomic Habits',
    streakDays: 4,
    isCompleted: false,
  },
];

export const MOCK_TOMORROW_EVENTS: TomorrowEvent[] = [
  {
    id: 'tmr_1',
    title: 'Seminar: Cloud Architecture',
    timeRange: '09:00 – 11:30',
    location: 'Hội trường B',
    color: '#3B82F6',
  },
  {
    id: 'tmr_2',
    title: 'Thực hành Phòng Lab Mạng',
    timeRange: '14:00 – 16:30',
    location: 'Lab 04',
    color: '#10B981',
  },
];
