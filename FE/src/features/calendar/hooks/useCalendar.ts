import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '../api/calendarApi';
import type { CalendarRangeParams, CreateEventPayload, UpdateEventPayload } from '../api/calendarApi';
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard';
import type { ApiCalendarItem } from '@/types';

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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventPayload }) => calendarApi.updateEvent(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: calendarKeys.all });
      const snapshots = queryClient.getQueriesData<ApiCalendarItem[]>({ queryKey: calendarKeys.all });

      for (const [queryKey, items] of snapshots) {
        if (!items) continue;
        queryClient.setQueryData<ApiCalendarItem[]>(queryKey, items.map((item) => {
          if (item.sourceType !== 'EVENT' || item.id !== id) return item;
          return {
            ...item,
            start: data.startAt ?? item.start,
            end: data.endAt ?? item.end,
            title: data.title ?? item.title,
            description: data.description === undefined ? item.description : data.description,
            location: data.location === undefined ? item.location : data.location,
          };
        }));
      }

      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([queryKey, items]) => {
        queryClient.setQueryData(queryKey, items);
      });
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
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
