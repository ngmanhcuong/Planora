import type { UserSettingsState } from '../types';

export const INITIAL_SETTINGS: UserSettingsState = {
  theme: 'light',
  language: 'vi',
  emailNotifications: true,
  pushNotifications: true,
  deadlineReminderHours: 24,
  timetableAlerts: true,
  soundEffects: false,
  twoFactorAuth: false,
  loginAlerts: true,
  autoSaveDrafts: true,
};
