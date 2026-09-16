import React from 'react';
import { Check, Sliders } from 'lucide-react';
import type { UserSettingsState } from '../types';
import { LANGUAGE_OPTIONS, normalizeLanguage, translate } from '@/lib/i18n';

export interface GeneralSettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => void;
}

export const GeneralSettingsSection: React.FC<GeneralSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const currentLanguage = normalizeLanguage(settings.language);

  return (
    <section className="flex flex-col gap-6 p-6 border-b border-[#E2E8F0]">
      <div className="border-b border-[#F1F5F9] pb-4">
        <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#4F46E5]" />
          {translate(currentLanguage, 'settings.general.title')}
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          {translate(currentLanguage, 'settings.general.subtitle')}
        </p>
      </div>

      {/* Language */}
      <div className="flex flex-col gap-3 py-2 border-b border-[#F1F5F9]">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#131B2E]">
            {translate(currentLanguage, 'settings.language.title')}
          </span>
          <span className="text-xs text-[#64748B]">
            {translate(currentLanguage, 'settings.language.subtitle')}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {LANGUAGE_OPTIONS.map((lang) => {
            const isActive = currentLanguage === lang.id;
            return (
            <button
              key={lang.id}
              type="button"
              onClick={() => onUpdate({ language: lang.id })}
              className={`group flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all ${
                isActive
                  ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#312E81] shadow-[0_8px_20px_rgba(79,70,229,0.12)]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#C7D2FE] hover:bg-white hover:text-[#131B2E]'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-lg leading-none">{lang.flag}</span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold">{lang.nativeName}</span>
                  <span className="block truncate text-[11px] text-[#64748B]">{lang.displayName}</span>
                </span>
              </span>
              {isActive && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
            );
          })}
        </div>
      </div>

      {/* Auto Save */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#131B2E]">
            {translate(currentLanguage, 'settings.autosave.title')}
          </span>
          <span className="text-xs text-[#64748B]">
            {translate(currentLanguage, 'settings.autosave.subtitle')}
          </span>
        </div>
        <button
          onClick={() => onUpdate({ autoSaveDrafts: !settings.autoSaveDrafts })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            settings.autoSaveDrafts ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              settings.autoSaveDrafts ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </section>
  );
};
