import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasksApi';
import type { TaskQueryParams, CreateTaskPayload, UpdateTaskPayload } from '../api/tasksApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';
import { settingsKeys } from '@/features/settings/hooks/useSettings';
import type { ApiUserSettings } from '@/types';

const playCompletionSound = (context: AudioContext) => {
  const startedAt = context.currentTime;
  [659.25, 783.99, 987.77].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = startedAt + index * 0.11;
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.2);
  });
};

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
  const audioContextRef = useRef<AudioContext | null>(null);
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' }) => {
      const settings = queryClient.getQueryData<ApiUserSettings>(settingsKeys.settings);
      if (status === 'COMPLETED' && settings?.soundEffects && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current ??= new AudioContextClass();
          void audioContextRef.current.resume();
        }
      }
      return tasksApi.changeTaskStatus(id, status);
    },
    onSuccess: (_, variables) => {
      const settings = queryClient.getQueryData<ApiUserSettings>(settingsKeys.settings);
      if (variables.status === 'COMPLETED' && settings?.soundEffects && audioContextRef.current) {
        playCompletionSound(audioContextRef.current);
      }
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
