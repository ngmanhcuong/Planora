import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/aiApi';
import type { ScheduleRequest, ApplyScheduleSession } from '../types';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';

export const aiKeys = {
  all: ['ai'] as const,
  status: ['ai', 'status'] as const,
};

export const useAiStatus = () => {
  return useQuery({
    queryKey: aiKeys.status,
    queryFn: () => aiApi.getStatus(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePrioritizeTasks = () => {
  return useMutation({
    mutationFn: (taskIds?: string[]) => aiApi.prioritizeTasks(taskIds),
  });
};

export const useGenerateSchedule = () => {
  return useMutation({
    mutationFn: (payload: ScheduleRequest) => aiApi.generateSchedule(payload),
  });
};

export const useApplySchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessions: ApplyScheduleSession[]) => aiApi.applySchedule(sessions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useAiAssistant = () => {
  return useMutation({
    mutationFn: (message: string) => aiApi.askAssistant(message),
  });
};
