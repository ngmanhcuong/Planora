import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settingsApi';
import type { UpdateSettingsPayload, ChangePasswordPayload } from '../api/settingsApi';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => settingsApi.changePassword(data),
  });
};
