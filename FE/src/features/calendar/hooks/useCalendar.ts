import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '../api/calendarApi';
import type { CalendarRangeParams, CreateEventPayload, UpdateEventPayload } from '../api/calendarApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';

export const calendarKeys = {
  all: ['calendar'] as const,
  range: (params: CalendarRangeParams) => ['calendar', 'range', params.start, params.end] as const,
  events: (params?: any) => ['events', 'list', params] as const,
};

export const useCalendarRange = (params: CalendarRangeParams) => {
  return useQuery({
    queryKey: calendarKeys.range(params),
    queryFn: () => calendarApi.getCalendarRange(params),
    enabled: !!params.start && !!params.end,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventPayload) => calendarApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventPayload }) => calendarApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};
