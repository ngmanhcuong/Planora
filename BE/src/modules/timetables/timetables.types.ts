import { ClassType } from '@prisma/client';

export interface TimetableResponse {
  id: string;
  userId: string;
  name: string;
  termName: string;
  academicYear: string;
  totalCredits: number;
  totalSubjects: number;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: TimetableItemResponse[];
}

export interface TimetableItemResponse {
  id: string;
  timetableId: string;
  courseName: string;
  subjectName: string;
  courseCode: string;
  dayOfWeek: number; // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
  startSlot: number;
  slotSpan: number;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  timeRange: string;
  room: string;
  lecturer: string;
  classType: string;
  type: ClassType;
  color: string;
  bgColor: string;
  textColor: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimetableListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isCurrent?: boolean;
}

export interface PaginatedTimetablesResponse {
  timetables: TimetableResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TimetableConflictQuery {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  excludeItemId?: string;
}

export interface TimetableConflictResponse {
  hasConflict: boolean;
  conflicts: {
    id: string;
    courseName: string;
    subjectName: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  }[];
}

export interface WeeklyTimetableResponse {
  timetable: TimetableResponse | null;
  days: {
    dayOfWeek: number;
    dayName: string;
    items: TimetableItemResponse[];
  }[];
}
