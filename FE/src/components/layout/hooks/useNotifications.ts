import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
};

export const useNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.getNotifications(),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(),
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
