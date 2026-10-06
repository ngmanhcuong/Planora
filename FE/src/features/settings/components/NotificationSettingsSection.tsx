import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Clock, Calendar, Volume2, Save, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { getMultiLangText, normalizeLanguage, translate } from '@/lib/i18n';
import type { UserSettingsState } from '../types';
import { Select } from '@/components/ui/Select';

export interface NotificationSettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => void;
  onSave: () => void;
  hasChanges: boolean;
  isSaving: boolean;
  isSaved: boolean;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate,
  onSave,
  hasChanges,
  isSaving,
  isSaved,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const language = normalizeLanguage(settings.language);
  const reminderOptions = [
    {
      value: '24',
      label: getMultiLangText(language, { vi: 'Trước 1 ngày', en: '1 day before', ja: '1日前', ko: '1일 전', zh: '提前1天', fr: '1 jour avant', de: '1 Tag vorher', es: '1 día antes', ru: 'За 1 день', th: 'ล่วงหน้า 1 วัน', it: '1 giorno prima', hi: '1 दिन पहले' }),
      icon: <Clock className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />,
    },
    {
      value: '168',
      label: getMultiLangText(language, { vi: 'Trước 1 tuần', en: '1 week before', ja: '1週間前', ko: '1주 전', zh: '提前1周', fr: '1 semaine avant', de: '1 Woche vorher', es: '1 semana antes', ru: 'За 1 неделю', th: 'ล่วงหน้า 1 สัปดาห์', it: '1 settimana prima', hi: '1 सप्ताह पहले' }),
      icon: <Clock className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />,
    },
    {
      value: '720',
      label: getMultiLangText(language, { vi: 'Trước 1 tháng', en: '1 month before', ja: '1か月前', ko: '1개월 전', zh: '提前1个月', fr: '1 mois avant', de: '1 Monat vorher', es: '1 mes antes', ru: 'За 1 месяц', th: 'ล่วงหน้า 1 เดือน', it: '1 mese prima', hi: '1 महीने पहले' }),
      icon: <Clock className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />,
    },
  ];

  return (
    <section className={`flex flex-col p-6 border-b border-[#E2E8F0] ${isCollapsed ? '' : 'gap-6'}`}>
      <div className={`flex items-center justify-between gap-4 ${isCollapsed ? '' : 'border-b border-[#F1F5F9] pb-4'}`}>
        <div>
          <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#4F46E5]" />
            {translate(language, 'settings.notifications.title')}
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {translate(language, 'settings.notifications.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((value) => !value)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Mở rộng cài đặt thông báo' : 'Thu gọn cài đặt thông báo'}
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-sub)] transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300"
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-1 duration-200">

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
        <Select
          value={String(settings.deadlineReminderHours)}
          onChange={(value) => onUpdate({ deadlineReminderHours: Number(value) })}
          options={reminderOptions}
          className="w-[190px] shrink-0"
          placeholder={reminderOptions[0].label}
        />
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

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#F1F5F9] pt-5">
        {isSaved && !hasChanges && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {getMultiLangText(language, { vi: 'Đã lưu cài đặt', en: 'Settings saved', ja: '設定を保存しました', ko: '설정이 저장되었습니다', zh: '设置已保存', fr: 'Paramètres enregistrés', de: 'Einstellungen gespeichert', es: 'Configuración guardada', ru: 'Настройки сохранены', th: 'บันทึกการตั้งค่าแล้ว', it: 'Impostazioni salvate', hi: 'सेटिंग सहेजी गई' })}
          </span>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#4338CA] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving
            ? getMultiLangText(language, { vi: 'Đang lưu...', en: 'Saving...', ja: '保存中...', ko: '저장 중...', zh: '正在保存...', fr: 'Enregistrement...', de: 'Wird gespeichert...', es: 'Guardando...', ru: 'Сохранение...', th: 'กำลังบันทึก...', it: 'Salvataggio...', hi: 'सहेजा जा रहा है...' })
            : getMultiLangText(language, { vi: 'Lưu cài đặt', en: 'Save settings', ja: '設定を保存', ko: '설정 저장', zh: '保存设置', fr: 'Enregistrer', de: 'Speichern', es: 'Guardar ajustes', ru: 'Сохранить', th: 'บันทึกการตั้งค่า', it: 'Salva impostazioni', hi: 'सेटिंग सहेजें' })}
        </button>
      </div>
        </div>
      )}
    </section>
  );
};
