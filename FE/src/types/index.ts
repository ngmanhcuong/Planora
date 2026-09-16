export type CategoryType = 'study' | 'work' | 'task' | 'meeting' | 'personal' | 'habit' | 'deadline';
export type PriorityType = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  studentId?: string;
  major?: string;
  university?: string;
}

export interface CategoryInfo {
  type: CategoryType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string; // e.g. "09:00" or ISO string
  endTime: string;   // e.g. "11:30" or ISO string
  date: string;      // YYYY-MM-DD
  category: CategoryType;
  location?: string;
  description?: string;
  isCompleted?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  category: CategoryType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isCompleted: boolean;
  notes?: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 0; // 1 = Mon ... 0 = Sun
  subjectName: string;
  subjectCode: string;
  room: string;
  lecturer: string;
  startTime: string; // "07:30"
  endTime: string;   // "09:50"
  color: string;
}

// API DTO Types matching Backend Response DTOs
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiCategory {
  id: string;
  name: string;
  type: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface ApiTask {
  id: string;
  userId: string;
  categoryId?: string | null;
  category?: ApiCategory | null;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  dueTime?: string | null;
  courseCode?: string | null;
  subtasksCountTotal?: number;
  subtasksCountCompleted?: number;
  completedAt?: string | null;
  isOverdue?: boolean;
  displayStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEvent {
  id: string;
  userId: string;
  categoryId?: string | null;
  category?: ApiCategory | null;
  title: string;
  description?: string | null;
  location?: string | null;
  startAt: string;
  endAt: string;
  allDay: boolean;
  hasConflict?: boolean;
  recurrenceType?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceInterval?: number;
  recurrenceEndDate?: string | null;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCalendarItem {
  id: string;
  sourceType: 'EVENT' | 'TASK' | 'TIMETABLE';
  title: string;
  start: string;
  end?: string | null;
  allDay: boolean;
  location?: string | null;
  status?: string;
  priority?: string;
  isOverdue?: boolean;
  displayStatus?: string;
  courseCode?: string | null;
  lecturer?: string | null;
  room?: string | null;
  category?: ApiCategory | null;
  recurrenceType?: string;
}

export interface ApiTimetable {
  id: string;
  userId: string;
  termName: string;
  academicYear: string;
  totalCredits: number;
  totalSubjects: number;
  isCurrent: boolean;
  items?: ApiTimetableItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiTimetableItem {
  id: string;
  timetableId: string;
  subjectName: string;
  courseCode?: string;
  dayOfWeek: number; // 0=Monday ... 6=Sunday
  startTime: string; // "07:30"
  endTime: string;   // "09:30"
  room?: string;
  lecturer?: string;
  type?: string;
  color?: string;
  bgColor?: string;
  textColor?: string;
  notes?: string | null;
}

export interface ApiHabit {
  id: string;
  userId: string;
  categoryId?: string | null;
  title: string;
  description?: string | null;
  targetFrequency: number;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string | null;
  color?: string;
  icon?: string;
  completedToday?: boolean;
  isCompletedToday?: boolean;
  logs?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  link?: string | null;
  createdAt: string;
}

export interface ApiDashboardData {
  summary: {
    tasksToday: number;
    tasksCompletedToday: number;
    overdueTasks: number;
    upcomingEvents: number;
    habitsCompletedToday: number;
    totalHabits: number;
    unreadNotifications: number;
  };
  tasks: {
    today: ApiTask[];
    overdue: ApiTask[];
  };
  events: {
    upcoming: ApiEvent[];
  };
  timetable: {
    today: ApiTimetableItem[];
  };
  habits: {
    today: ApiHabit[];
    completionRate: number;
  };
  notifications: {
    unreadCount: number;
    recent: ApiNotification[];
  };
  productivity: {
    todayScore: number;
  };
}

export interface ApiProfile {
  userId: string;
  name: string;
  email: string;
  studentId?: string | null;
  major?: string | null;
  university?: string | null;
  gpa?: number | null;
  completedCredits?: number | null;
  totalCredits?: number | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface ApiUserSettings {
  theme: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineReminderHours: number;
  timetableAlerts: boolean;
  soundEffects: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  autoSaveDrafts: boolean;
}
