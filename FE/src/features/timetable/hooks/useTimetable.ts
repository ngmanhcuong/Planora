import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi } from '../api/timetableApi';
import type { CreateTimetablePayload, CreateTimetableItemPayload, UpdateTimetableItemPayload } from '../api/timetableApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';

export const timetableKeys = {
  all: ['timetable'] as const,
  weekly: ['timetable', 'weekly'] as const,
  list: ['timetables', 'list'] as const,
};

export const useWeeklyTimetable = () => {
  return useQuery({
    queryKey: timetableKeys.weekly,
    queryFn: () => timetableApi.getWeeklyTimetable(),
  });
};

export const useTimetables = () => {
  return useQuery({
    queryKey: timetableKeys.list,
    queryFn: () => timetableApi.getTimetables(),
  });
};

export const useCreateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimetablePayload) => timetableApi.createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useCreateTimetableItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ timetableId, data }: { timetableId: string; data: CreateTimetableItemPayload }) =>
      timetableApi.createTimetableItem(timetableId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useUpdateTimetableItem = () => {
  const queryClient = useQueryClient();
  type WeeklyData = Awaited<ReturnType<typeof timetableApi.getWeeklyTimetable>>;
  return useMutation({
    mutationFn: ({ timetableId, itemId, data }: { timetableId: string; itemId: string; data: UpdateTimetableItemPayload }) =>
      timetableApi.updateTimetableItem(timetableId, itemId, data),
    onMutate: async ({ itemId, data }) => {
      await queryClient.cancelQueries({ queryKey: timetableKeys.weekly });
      const previous = queryClient.getQueryData<WeeklyData>(timetableKeys.weekly);
      queryClient.setQueryData<WeeklyData>(timetableKeys.weekly, (current) => current ? {
        ...current,
        items: current.items.map(item => item.id === itemId ? { ...item, ...data } : item),
      } : current);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(timetableKeys.weekly, context.previous);
    },
    onSuccess: (saved, { itemId }) => {
      queryClient.setQueryData<WeeklyData>(timetableKeys.weekly, (current) => current ? {
        ...current,
        items: current.items.map(item => item.id === itemId ? saved : item),
      } : current);
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: timetableKeys.all });
    },
  });
};

export const useDeleteTimetableItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ timetableId, itemId }: { timetableId: string; itemId: string }) =>
      timetableApi.deleteTimetableItem(timetableId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};
