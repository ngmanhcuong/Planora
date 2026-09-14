import { apiClient } from '@/lib/axios';
import type { ApiEvent, ApiCalendarItem, ApiResponse } from '@/types';

export interface CalendarRangeParams {
  start: string;
  end: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  location?: string;
  categoryId?: string | null;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  recurrenceType?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceInterval?: number;
  recurrenceEndDate?: string | null;
  color?: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  location?: string;
  categoryId?: string | null;
  startAt?: string;
  endAt?: string;
  allDay?: boolean;
  recurrenceType?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceInterval?: number;
  recurrenceEndDate?: string | null;
  color?: string;
}

export const calendarApi = {
  getCalendarRange: async (params: CalendarRangeParams): Promise<ApiCalendarItem[]> => {
    const response = await apiClient.get<ApiResponse<{ items: ApiCalendarItem[] }>>('/calendar', { params });
    return response.data.data.items;
  },

  listEvents: async (params?: any): Promise<{ events: ApiEvent[]; pagination: any }> => {
    const response = await apiClient.get<ApiResponse<{ events: ApiEvent[]; pagination: any }>>('/events', { params });
    return response.data.data;
  },

  createEvent: async (payload: CreateEventPayload): Promise<ApiEvent> => {
    const response = await apiClient.post<ApiResponse<{ event: ApiEvent }>>('/events', payload);
    return response.data.data.event;
  },

  updateEvent: async (id: string, payload: UpdateEventPayload): Promise<ApiEvent> => {
    const response = await apiClient.patch<ApiResponse<{ event: ApiEvent }>>(`/events/${id}`, payload);
    return response.data.data.event;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  checkConflicts: async (startAt: string, endAt: string, excludeEventId?: string) => {
    const response = await apiClient.get('/events/conflicts/check', {
      params: { startAt, endAt, excludeEventId },
    });
    return response.data.data;
  },
};
