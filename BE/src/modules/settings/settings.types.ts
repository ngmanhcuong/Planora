import { ThemeMode, Language } from '@prisma/client';

export interface UserSettingsResponse {
  userId: string;
  theme: ThemeMode;
  language: Language;
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineReminderHours: number;
  timetableAlerts: boolean;
  soundEffects: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  autoSaveDrafts: boolean;
}
