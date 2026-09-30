import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { localizeNotification } from '@/lib/notificationLanguage';
import type { ApiNotification } from '@/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
};

export const useNotifications = () => {
  const language = useCurrentLanguage();
  return useQuery({
    queryKey: [...notificationKeys.all, 'list'],
    queryFn: () => notificationsApi.getNotifications(),
    select: (items) => items.map(item => localizeNotification(item, language)),
    refetchInterval: 60000,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60000,
  });
};

export const useMarkReadNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const previousList = queryClient.getQueryData<ApiNotification[]>([...notificationKeys.all, 'list']);
      const previousCount = queryClient.getQueryData<number>(notificationKeys.unreadCount);
      const targetWasUnread = previousList?.some(item => item.id === id && !item.isRead) ?? false;

      queryClient.setQueryData<ApiNotification[]>([...notificationKeys.all, 'list'], (items = []) =>
        items.map(item => item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item)
      );
      if (targetWasUnread) {
        queryClient.setQueryData<number>(notificationKeys.unreadCount, (count = 0) => Math.max(0, count - 1));
      }

      return { previousList, previousCount };
    },
    onError: (_error, _id, context) => {
      if (context?.previousList) queryClient.setQueryData([...notificationKeys.all, 'list'], context.previousList);
      if (context?.previousCount !== undefined) queryClient.setQueryData(notificationKeys.unreadCount, context.previousCount);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'list'] }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
  });
};

export const useMarkAllReadNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const previousList = queryClient.getQueryData<ApiNotification[]>([...notificationKeys.all, 'list']);
      const previousCount = queryClient.getQueryData<number>(notificationKeys.unreadCount);

      queryClient.setQueryData<ApiNotification[]>([...notificationKeys.all, 'list'], (items = []) =>
        items.map(item => item.isRead ? item : { ...item, isRead: true, readAt: new Date().toISOString() })
      );
      queryClient.setQueryData<number>(notificationKeys.unreadCount, 0);

      return { previousList, previousCount };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousList) queryClient.setQueryData([...notificationKeys.all, 'list'], context.previousList);
      if (context?.previousCount !== undefined) queryClient.setQueryData(notificationKeys.unreadCount, context.previousCount);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'list'] }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
  });
};
