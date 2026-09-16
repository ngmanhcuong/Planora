import React from 'react';
import { Bell, Mail, Smartphone, Clock, Calendar, Volume2 } from 'lucide-react';
import { normalizeLanguage, translate } from '@/lib/i18n';
import type { UserSettingsState } from '../types';

export interface NotificationSettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => void;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const language = normalizeLanguage(settings.language);
  const beforeHours = (hours: number) =>
    translate(language, 'settings.notifications.deadline.beforeHours').replace('{hours}', String(hours));

  return (
    <section className="flex flex-col gap-6 p-6 border-b border-[#E2E8F0]">
      <div className="border-b border-[#F1F5F9] pb-4">
        <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#4F46E5]" />
          {translate(language, 'settings.notifications.title')}
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          {translate(language, 'settings.notifications.subtitle')}
        </p>
      </div>

      {/* Email Notifications */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F1F5F9]">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-[#131B2E]">{translate(language, 'settings.notifications.email.title')}</span>
            <span className="text-xs text-[#64748B]">{translate(language, 'settings.notifications.email.subtitle')}</span>
          </div>
        </div>
        <button
          onClick={() => onUpdate({ emailNotifications: !settings.emailNotifications })}
          className={`settings-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            settings.emailNotifications ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]'
          }`}
        >
          <span
            className={`settings-switch-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Push Notifications */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F1F5F9]">
        <div className="flex items-start gap-3">
          <Smartphone className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-[#131B2E]">{translate(language, 'settings.notifications.push.title')}</span>
            <span className="text-xs text-[#64748B]">{translate(language, 'settings.notifications.push.subtitle')}</span>
          </div>
        </div>
        <button
          onClick={() => onUpdate({ pushNotifications: !settings.pushNotifications })}
          className={`settings-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            settings.pushNotifications ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]'
          }`}
        >
          <span
            className={`settings-switch-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Deadline Reminder Hours */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F1F5F9]">
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-[#131B2E]">{translate(language, 'settings.notifications.deadline.title')}</span>
            <span className="text-xs text-[#64748B]">{translate(language, 'settings.notifications.deadline.subtitle')}</span>
          </div>
        </div>
        <select
          value={settings.deadlineReminderHours}
          onChange={(e) => onUpdate({ deadlineReminderHours: Number(e.target.value) })}
          className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
        >
          <option value={1}>{translate(language, 'settings.notifications.deadline.beforeHour')}</option>
          <option value={3}>{beforeHours(3)}</option>
          <option value={12}>{beforeHours(12)}</option>
          <option value={24}>{translate(language, 'settings.notifications.deadline.beforeDay')}</option>
          <option value={48}>{translate(language, 'settings.notifications.deadline.beforeDays')}</option>
        </select>
      </div>

      {/* Timetable Alerts */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F1F5F9]">
        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 text-[#006E4B] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-[#131B2E]">{translate(language, 'settings.notifications.timetable.title')}</span>
            <span className="text-xs text-[#64748B]">{translate(language, 'settings.notifications.timetable.subtitle')}</span>
          </div>
        </div>
        <button
          onClick={() => onUpdate({ timetableAlerts: !settings.timetableAlerts })}
          className={`settings-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            settings.timetableAlerts ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]'
          }`}
        >
          <span
            className={`settings-switch-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              settings.timetableAlerts ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Sound Effects */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex items-start gap-3">
          <Volume2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-[#131B2E]">{translate(language, 'settings.notifications.sound.title')}</span>
            <span className="text-xs text-[#64748B]">{translate(language, 'settings.notifications.sound.subtitle')}</span>
          </div>
        </div>
        <button
          onClick={() => onUpdate({ soundEffects: !settings.soundEffects })}
          className={`settings-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            settings.soundEffects ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]'
          }`}
        >
          <span
            className={`settings-switch-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </section>
  );
};
