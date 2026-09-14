import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasksApi';
import type { TaskQueryParams, CreateTaskPayload, UpdateTaskPayload } from '../api/tasksApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';

export const taskKeys = {
  all: ['tasks'] as const,
  list: (params?: TaskQueryParams) => ['tasks', 'list', params] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
};

export const useTasks = (params?: TaskQueryParams) => {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => tasksApi.getTasks(params),
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTaskById(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskPayload) => tasksApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) => tasksApi.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};

export const useChangeTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' }) =>
      tasksApi.changeTaskStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};
