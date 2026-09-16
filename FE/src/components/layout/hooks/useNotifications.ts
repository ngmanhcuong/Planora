import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
};

export const useNotifications = () => {
  return useQuery({
    queryKey: [...notificationKeys.all, 'list'],
    queryFn: () => notificationsApi.getNotifications(),
    refetchInterval: 60000,
  });
};

export const useUnreadCount = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: async () => {
      const count = await notificationsApi.getUnreadCount();
      void queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'list'] });
      return count;
    },
    refetchInterval: 60000,
  });
};

export const useMarkReadNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useMarkAllReadNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};
