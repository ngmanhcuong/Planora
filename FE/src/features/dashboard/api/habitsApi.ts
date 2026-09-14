import { apiClient } from '@/lib/axios';
import type { ApiHabit, ApiResponse } from '@/types';

export interface CreateHabitPayload {
  title: string;
  description?: string;
  targetFrequency?: number;
  color?: string;
  icon?: string;
}

export const habitsApi = {
  getHabits: async (): Promise<ApiHabit[]> => {
    const response = await apiClient.get<ApiResponse<{ habits: ApiHabit[] }>>('/habits');
    return response.data.data.habits;
  },

  getTodayHabits: async (): Promise<ApiHabit[]> => {
    const response = await apiClient.get<ApiResponse<{ habits: ApiHabit[] }>>('/habits/today');
    return response.data.data.habits;
  },

  createHabit: async (payload: CreateHabitPayload): Promise<ApiHabit> => {
    const response = await apiClient.post<ApiResponse<{ habit: ApiHabit }>>('/habits', payload);
    return response.data.data.habit;
  },

  checkIn: async (id: string, date?: string): Promise<any> => {
    const response = await apiClient.post(`/habits/${id}/check-in`, { date });
    return response.data.data;
  },

  undoCheckIn: async (id: string, date?: string): Promise<any> => {
    const response = await apiClient.delete(`/habits/${id}/check-in`, { data: { date } });
    return response.data.data;
  },
};
