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
  return useMutation({
    mutationFn: ({ timetableId, itemId, data }: { timetableId: string; itemId: string; data: UpdateTimetableItemPayload }) =>
      timetableApi.updateTimetableItem(timetableId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
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
