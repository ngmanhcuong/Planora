import { apiClient } from '@/lib/axios';
import type { ApiDashboardData, ApiResponse } from '@/types';

export const dashboardApi = {
  getDashboard: async (): Promise<ApiDashboardData> => {
    const response = await apiClient.get<ApiResponse<ApiDashboardData>>('/dashboard');
    return response.data.data;
  },

  getWeeklyStats: async (date?: string) => {
    const response = await apiClient.get('/dashboard/statistics/weekly', {
      params: date ? { date } : undefined,
    });
    return response.data.data;
  },

  getMonthlyStats: async (month?: string) => {
    const response = await apiClient.get('/dashboard/statistics/monthly', {
      params: month ? { month } : undefined,
    });
    return response.data.data;
  },
};
