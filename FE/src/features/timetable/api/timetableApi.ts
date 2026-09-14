import { apiClient } from '@/lib/axios';
import type { ApiTimetable, ApiTimetableItem, ApiResponse } from '@/types';

export interface CreateTimetablePayload {
  name?: string;
  termName?: string;
  academicYear?: string;
  isCurrent?: boolean;
}

export interface CreateTimetableItemPayload {
  courseName?: string;
  subjectName?: string;
  courseCode?: string;
  dayOfWeek: number; // 0=Mon ... 6=Sun
  startTime: string; // "07:30"
  endTime: string;   // "09:30"
  room?: string;
  lecturer?: string;
  classType?: 'THEORY' | 'PRACTICE' | 'EXAM' | 'LECTURE' | 'LAB';
  type?: 'THEORY' | 'PRACTICE' | 'EXAM' | 'LECTURE' | 'LAB';
  color?: string;
}

export interface UpdateTimetableItemPayload {
  courseName?: string;
  subjectName?: string;
  courseCode?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  room?: string;
  lecturer?: string;
  classType?: 'THEORY' | 'PRACTICE' | 'EXAM' | 'LECTURE' | 'LAB';
  type?: 'THEORY' | 'PRACTICE' | 'EXAM' | 'LECTURE' | 'LAB';
  color?: string;
}

export const timetableApi = {
  getWeeklyTimetable: async (): Promise<{ timetable: ApiTimetable | null; items: ApiTimetableItem[] }> => {
    const response = await apiClient.get<ApiResponse<{ timetable: ApiTimetable | null; items: ApiTimetableItem[] }>>('/timetable/week');
    return response.data.data;
  },

  getTimetables: async (): Promise<ApiTimetable[]> => {
    const response = await apiClient.get<ApiResponse<{ timetables: ApiTimetable[] }>>('/timetables');
    return response.data.data.timetables;
  },

  createTimetable: async (payload: CreateTimetablePayload): Promise<ApiTimetable> => {
    const response = await apiClient.post<ApiResponse<{ timetable: ApiTimetable }>>('/timetables', payload);
    return response.data.data.timetable;
  },

  createTimetableItem: async (timetableId: string, payload: CreateTimetableItemPayload): Promise<ApiTimetableItem> => {
    const response = await apiClient.post<ApiResponse<{ item: ApiTimetableItem }>>(`/timetables/${timetableId}/items`, payload);
    return response.data.data.item;
  },

  updateTimetableItem: async (timetableId: string, itemId: string, payload: UpdateTimetableItemPayload): Promise<ApiTimetableItem> => {
    const response = await apiClient.patch<ApiResponse<{ item: ApiTimetableItem }>>(`/timetables/${timetableId}/items/${itemId}`, payload);
    return response.data.data.item;
  },

  deleteTimetableItem: async (timetableId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/timetables/${timetableId}/items/${itemId}`);
  },
};
