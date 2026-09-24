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
  categoryLabel: string;
  location?: string;
  speaker?: string;
  notes?: string;
  hasConflict?: boolean;
  color: string;
  bgColor: string;
  textColor: string;
}

