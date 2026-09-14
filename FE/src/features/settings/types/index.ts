export interface UserSettingsState {
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineReminderHours: number;
  timetableAlerts: boolean;
  soundEffects: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  autoSaveDrafts: boolean;
}

export type SettingsTab = 'general' | 'notifications' | 'security' | 'appearance';
