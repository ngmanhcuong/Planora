import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settingsApi';
import type { UpdateSettingsPayload, ChangePasswordPayload } from '../api/settingsApi';
import type { ApiUserSettings } from '@/types';

export const settingsKeys = {
  settings: ['settings'] as const,
};

export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.settings,
    queryFn: () => settingsApi.getSettings(),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSettingsPayload) => settingsApi.updateSettings(data),
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.settings });
      const previousSettings = queryClient.getQueryData<ApiUserSettings>(settingsKeys.settings);

      queryClient.setQueryData<ApiUserSettings>(settingsKeys.settings, (current) =>
        current ? { ...current, ...updated } : current
      );

      return { previousSettings };
    },
    onError: (_error, _updated, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.settings, context.previousSettings);
      }
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsKeys.settings, settings);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => settingsApi.changePassword(data),
  });
};
