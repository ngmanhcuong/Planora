import type { CategoryType } from '@/types';

export type CalendarViewMode = 'day' | 'week' | 'month';

export interface CalendarEventItem {
  id: string;
  sourceType: 'EVENT' | 'TASK' | 'TIMETABLE';
  title: string;
  dateKey: string;
  timeRange: string;
  dayIndex: number; // 0 = Mon, 1 = Tue ... 6 = Sun
  startTopPx: number;
  heightPx: number;
  startAt: string;
  endAt?: string | null;
  category: CategoryType;
  categoryId?: string | null;
  categoryLabel: string;
  location?: string;
  description?: string | null;
  priority?: string | null;
  status?: string | null;
  courseCode?: string | null;
  timetableId?: string | null;
  timetableItemId?: string | null;
  speaker?: string;
  notes?: string;
  hasConflict?: boolean;
  isPast?: boolean;
  isCompleted?: boolean;
  dragLocked?: boolean;
  color: string;
  bgColor: string;
  textColor: string;
}

