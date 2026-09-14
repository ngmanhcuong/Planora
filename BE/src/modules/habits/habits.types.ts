export interface HabitResponse {
  id: string;
  userId: string;
  categoryId: string | null;
  name: string;
  title: string;
  description: string | null;
  targetFrequency: number;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  isCompletedToday: boolean;
  completedToday: boolean;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitListQuery {
  search?: string;
  page?: number;
  limit?: number;
  completedToday?: boolean;
}

export interface PaginatedHabitsResponse {
  habits: HabitResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HabitHistoryQuery {
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export interface HabitLogResponse {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string | null;
  createdAt: Date;
}

export interface HabitHistoryResponse {
  logs: HabitLogResponse[];
  summary: {
    completedDays: number;
    currentStreak: number;
    bestStreak: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HabitWeeklySummaryResponse {
  habitId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday)
  targetFrequency: number;
  completedDays: number;
  goalReached: boolean;
  days: {
    date: string;
    dayName: string;
    dayOfWeek: number;
    completed: boolean;
  }[];
}

export interface TodayHabitsResponse {
  date: string; // YYYY-MM-DD
  habits: HabitResponse[];
  summary: {
    total: number;
    completed: number;
    remaining: number;
    completionRate: number; // 0 - 100
  };
}
