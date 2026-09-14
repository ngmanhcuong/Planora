import { NotificationResponse } from '../notifications/notifications.types';

export interface DashboardSummary {
  tasksToday: number;
  tasksCompletedToday: number;
  overdueTasks: number;
  upcomingEvents: number;
  habitsCompletedToday: number;
  totalHabits: number;
  unreadNotifications: number;
}

export interface DashboardTaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date;
  dueTime: string | null;
  courseCode: string | null;
  category?: any;
  isOverdue: boolean;
  displayStatus: string;
}

export interface DashboardEventItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location: string | null;
  category?: any;
}

export interface DashboardTimetableItem {
  id: string;
  courseName: string;
  subjectName: string;
  courseCode: string;
  startTime: string;
  endTime: string;
  room: string;
  lecturer: string;
  type: string;
}

export interface DashboardHabitItem {
  id: string;
  name: string;
  title: string;
  completedToday: boolean;
  isCompletedToday: boolean;
  currentStreak: number;
  bestStreak: number;
  targetFrequency: number;
  color: string;
  icon: string;
}

export interface DashboardProductivity {
  todayScore: number;
  weekScore: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  tasks: {
    today: DashboardTaskItem[];
    overdue: DashboardTaskItem[];
  };
  events: {
    upcoming: DashboardEventItem[];
  };
  timetable: {
    today: DashboardTimetableItem[];
  };
  habits: {
    today: DashboardHabitItem[];
    completionRate: number;
  };
  notifications: {
    unreadCount: number;
    recent: NotificationResponse[];
  };
  productivity: DashboardProductivity;
}

export interface WeeklyStatisticsResponse {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday)
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
  };
  habits: {
    totalCheckIns: number;
    possibleTarget: number;
    completionRate: number;
  };
  events: {
    total: number;
  };
  daily: {
    date: string;
    dayName: string;
    dayOfWeek: number;
    tasksCompleted: number;
    tasksTotal: number;
    habitCheckIns: number;
    events: number;
  }[];
  productivityScore: number;
}

export interface MonthlyStatisticsResponse {
  month: string; // YYYY-MM
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
  habits: {
    checkIns: number;
  };
  events: {
    total: number;
  };
  productivityScore: number;
}
