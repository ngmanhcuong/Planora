import React from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import { normalizeLanguage, translate } from '@/lib/i18n';
import type { UserSettingsState } from '../types';

export interface AppearanceSettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => void;
}

export const AppearanceSettingsSection: React.FC<AppearanceSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const language = normalizeLanguage(settings.language);
  const themes: { id: 'light' | 'dark'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: translate(language, 'settings.appearance.theme.light'), icon: Sun },
    { id: 'dark', label: translate(language, 'settings.appearance.theme.dark'), icon: Moon },
  ];

  return (
    <section className="flex flex-col gap-6 p-6">
      <div className="border-b border-[#F1F5F9] pb-4">
        <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#4F46E5]" />
          {translate(language, 'settings.appearance.title')}
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          {translate(language, 'settings.appearance.subtitle')}
        </p>
      </div>

      {/* Theme Picker */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-[#131B2E]">{translate(language, 'settings.appearance.theme.title')}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = settings.theme === t.id;

            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onUpdate({ theme: t.id })}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'theme-option-selected bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5] shadow-xs ring-2 ring-[#4F46E5]/20'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white hover:text-[#131B2E]'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-[#4F46E5]' : 'text-[#64748B]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </section>
  );
};
