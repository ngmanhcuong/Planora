import React, { useState } from 'react';
import { SettingsNavTabs } from './components/SettingsNavTabs';
import { GeneralSettingsSection } from './components/GeneralSettingsSection';
import { NotificationSettingsSection } from './components/NotificationSettingsSection';
import { SecuritySettingsSection } from './components/SecuritySettingsSection';
import { AppearanceSettingsSection } from './components/AppearanceSettingsSection';
import { useSettings, useUpdateSettings } from './hooks/useSettings';
import type { SettingsTab, UserSettingsState } from './types';
import { Loader2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { data: backendSettings, isLoading, isError } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const settings: UserSettingsState = {
    theme: (backendSettings?.theme as any) || 'light',
    language: (backendSettings?.language as 'vi' | 'en') || 'vi',
    emailNotifications: backendSettings?.emailNotifications ?? true,
    pushNotifications: backendSettings?.pushNotifications ?? true,
    deadlineReminderHours: backendSettings?.deadlineReminderHours ?? 24,
    timetableAlerts: backendSettings?.timetableAlerts ?? true,
    soundEffects: backendSettings?.soundEffects ?? false,
    twoFactorAuth: backendSettings?.twoFactorAuth ?? false,
    loginAlerts: backendSettings?.loginAlerts ?? true,
    autoSaveDrafts: backendSettings?.autoSaveDrafts ?? true,
  };

  const handleUpdateSettings = (updated: Partial<UserSettingsState>) => {
    updateSettingsMutation.mutate(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
        <span className="ml-2 text-xs font-semibold text-[#64748B]">Đang tải cài đặt...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
        Đã xảy ra lỗi khi tải cài đặt. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-h-screen pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-[#131B2E] tracking-tight font-heading">
          Cài đặt ứng dụng
        </h1>
        <p className="text-xs text-[#64748B]">
          Tùy chỉnh thông báo, bảo mật và giao diện hiển thị cho tài khoản Planora của bạn.
        </p>
      </div>

      <SettingsNavTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {activeTab === 'general' && (
        <GeneralSettingsSection settings={settings} onUpdate={handleUpdateSettings} />
      )}

      {activeTab === 'notifications' && (
        <NotificationSettingsSection settings={settings} onUpdate={handleUpdateSettings} />
      )}

      {activeTab === 'security' && (
        <SecuritySettingsSection settings={settings} onUpdate={handleUpdateSettings} />
      )}

      {activeTab === 'appearance' && (
        <AppearanceSettingsSection settings={settings} onUpdate={handleUpdateSettings} />
      )}
    </div>
  );
};

