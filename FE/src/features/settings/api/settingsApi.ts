import { apiClient } from '@/lib/axios';
import type { ApiUserSettings, ApiResponse } from '@/types';

export interface UpdateSettingsPayload {
  theme?: string;
  language?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  deadlineReminderHours?: number;
  timetableAlerts?: boolean;
  soundEffects?: boolean;
  twoFactorAuth?: boolean;
  loginAlerts?: boolean;
  autoSaveDrafts?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const settingsApi = {
  getSettings: async (): Promise<ApiUserSettings> => {
    const response = await apiClient.get<ApiResponse<{ settings: ApiUserSettings }>>('/settings');
    return response.data.data.settings;
  },

  updateSettings: async (payload: UpdateSettingsPayload): Promise<ApiUserSettings> => {
    const response = await apiClient.patch<ApiResponse<{ settings: ApiUserSettings }>>('/settings', payload);
    return response.data.data.settings;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    const currentPassword = payload.currentPassword || payload.oldPassword || '';
    const newPassword = payload.newPassword || '';
    const confirmPassword = payload.confirmPassword || newPassword;
    await apiClient.patch('/settings/password', { currentPassword, newPassword, confirmPassword });
  },
};
