import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '../api/habitsApi';
import type { CreateHabitPayload } from '../api/habitsApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';

export const habitKeys = {
  all: ['habits'] as const,
  today: ['habits', 'today'] as const,
};

export const useHabits = () => {
  return useQuery({
    queryKey: habitKeys.all,
    queryFn: () => habitsApi.getHabits(),
  });
};

export const useTodayHabits = () => {
  return useQuery({
    queryKey: habitKeys.today,
    queryFn: () => habitsApi.getTodayHabits(),
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHabitPayload) => habitsApi.createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useCheckInHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date?: string }) => habitsApi.checkIn(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useUndoCheckInHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date?: string }) => habitsApi.undoCheckIn(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};
