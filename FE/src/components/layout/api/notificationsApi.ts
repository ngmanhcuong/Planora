import { apiClient } from '@/lib/axios';
import type { ApiNotification, ApiResponse } from '@/types';

export const notificationsApi = {
  getNotifications: async (): Promise<ApiNotification[]> => {
    await apiClient.post('/notifications/generate');
    const response = await apiClient.get<ApiResponse<{ notifications: ApiNotification[] }>>('/notifications');
    return response.data.data.notifications;
  },

  getUnreadCount: async (): Promise<number> => {
    await apiClient.post('/notifications/generate');
    const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
