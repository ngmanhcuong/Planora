import React, { useEffect, useState } from 'react';
import { GeneralSettingsSection } from './components/GeneralSettingsSection';
import { NotificationSettingsSection } from './components/NotificationSettingsSection';
import { SecuritySettingsSection } from './components/SecuritySettingsSection';
import { AppearanceSettingsSection } from './components/AppearanceSettingsSection';
import { useSettings, useUpdateSettings } from './hooks/useSettings';
import type { UserSettingsState } from './types';
import { Loader2 } from 'lucide-react';
import { normalizeLanguage, translate } from '@/lib/i18n';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';

export const SettingsPage: React.FC = () => {
  const currentLanguage = useCurrentLanguage();
  const { data: backendSettings, isLoading, isError } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [localSettings, setLocalSettings] = useState<UserSettingsState | null>(null);
  const [notificationDirty, setNotificationDirty] = useState(false);
  const [notificationSaved, setNotificationSaved] = useState(false);

  const reminderHours = backendSettings?.deadlineReminderHours ?? 24;
  const syncedSettings: UserSettingsState = {
    theme: ((backendSettings?.theme || 'light').toLowerCase() as UserSettingsState['theme']),
    language: normalizeLanguage(backendSettings?.language),
    emailNotifications: backendSettings?.emailNotifications ?? true,
    pushNotifications: backendSettings?.pushNotifications ?? true,
    deadlineReminderHours: [24, 168, 720].includes(reminderHours) ? reminderHours : 24,
    timetableAlerts: backendSettings?.timetableAlerts ?? true,
    soundEffects: backendSettings?.soundEffects ?? false,
    twoFactorAuth: backendSettings?.twoFactorAuth ?? false,
    loginAlerts: backendSettings?.loginAlerts ?? true,
    autoSaveDrafts: backendSettings?.autoSaveDrafts ?? true,
  };

  useEffect(() => {
    if (backendSettings) {
      setLocalSettings((current) => notificationDirty && current ? {
        ...syncedSettings,
        emailNotifications: current.emailNotifications,
        pushNotifications: current.pushNotifications,
        deadlineReminderHours: current.deadlineReminderHours,
        timetableAlerts: current.timetableAlerts,
        soundEffects: current.soundEffects,
      } : syncedSettings);
    }
  }, [backendSettings, notificationDirty]);

  const settings = localSettings ?? syncedSettings;

  const handleUpdateSettings = (updated: Partial<UserSettingsState>) => {
    setLocalSettings((current) => ({
      ...(current ?? settings),
      ...updated,
    }));
    updateSettingsMutation.mutate(updated);
  };

  const handleUpdateSecuritySettings = async (updated: Partial<UserSettingsState>) => {
    const previous = settings;
    setLocalSettings((current) => ({ ...(current ?? settings), ...updated }));
    try {
      await updateSettingsMutation.mutateAsync(updated);
    } catch (error) {
      setLocalSettings(previous);
      throw error;
    }
  };

  const handleUpdateNotificationSettings = (updated: Partial<UserSettingsState>) => {
    setLocalSettings((current) => ({
      ...(current ?? settings),
      ...updated,
    }));
    setNotificationDirty(true);
    setNotificationSaved(false);
  };

  const handleSaveNotificationSettings = () => {
    updateSettingsMutation.mutate({
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      deadlineReminderHours: settings.deadlineReminderHours,
      timetableAlerts: settings.timetableAlerts,
      soundEffects: settings.soundEffects,
    }, {
      onSuccess: () => {
        setNotificationDirty(false);
        setNotificationSaved(true);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
        <span className="ml-2 text-xs font-semibold text-[#64748B]">
          {translate(currentLanguage, 'settings.loading')}
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
        {translate(currentLanguage, 'settings.error')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-[#131B2E] tracking-tight font-heading">
          {translate(settings.language, 'settings.title')}
        </h1>
        <p className="text-xs text-[#64748B]">
          {translate(settings.language, 'settings.subtitle')}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <GeneralSettingsSection settings={settings} onUpdate={handleUpdateSettings} />
        <NotificationSettingsSection
          settings={settings}
          onUpdate={handleUpdateNotificationSettings}
          onSave={handleSaveNotificationSettings}
          hasChanges={notificationDirty}
          isSaving={updateSettingsMutation.isPending}
          isSaved={notificationSaved}
        />
        <SecuritySettingsSection settings={settings} onUpdate={handleUpdateSecuritySettings} />
        <AppearanceSettingsSection settings={settings} onUpdate={handleUpdateSettings} />
      </div>
    </div>
  );
};
