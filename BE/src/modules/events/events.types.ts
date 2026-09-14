import { RecurrenceType } from '@prisma/client';

export interface EventResponse {
  id: string;
  userId: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    type: string;
    color: string;
    bgColor: string;
    textColor: string;
  } | null;
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  hasConflict: boolean;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  recurrenceEndDate: Date | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventListQuery {
  start?: string;
  end?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'startAt' | 'endAt' | 'startTime' | 'endTime' | 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedEventsResponse {
  events: EventResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConflictCheckQuery {
  startAt: string;
  endAt: string;
  excludeEventId?: string;
}

export interface ConflictCheckResponse {
  hasConflict: boolean;
  conflicts: {
    id: string;
    title: string;
    startAt: Date;
    endAt: Date;
  }[];
}

export interface CalendarRangeQuery {
  start: string;
  end: string;
}

export interface CalendarItemResponse {
  id: string;
  sourceType: 'EVENT' | 'TASK';
  title: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
  location?: string | null;
  status?: string;
  priority?: string;
  isOverdue?: boolean;
  displayStatus?: string;
  courseCode?: string | null;
  category?: {
    id: string;
    name: string;
    type: string;
    color: string;
    bgColor: string;
    textColor: string;
  } | null;
  recurrenceType?: RecurrenceType;
}
