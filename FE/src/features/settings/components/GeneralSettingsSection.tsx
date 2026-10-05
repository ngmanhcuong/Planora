import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Languages, Save, SlidersHorizontal } from 'lucide-react';
import type { UserSettingsState } from '../types';
import { LANGUAGE_OPTIONS, normalizeLanguage, translate } from '@/lib/i18n';

export interface GeneralSettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => void;
}

export const GeneralSettingsSection: React.FC<GeneralSettingsProps> = ({ settings, onUpdate }) => {
  const currentLanguage = normalizeLanguage(settings.language);
  const selectedLanguage = LANGUAGE_OPTIONS.find((item) => item.id === currentLanguage) ?? LANGUAGE_OPTIONS[0];
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setLanguageMenuOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
          <SlidersHorizontal className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-heading text-[15px] font-bold text-[var(--color-text-main)]">{translate(currentLanguage, 'settings.general.title')}</h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-sub)]">{translate(currentLanguage, 'settings.general.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="grid gap-4 rounded-2xl bg-[var(--color-canvas)] p-4 ring-1 ring-inset ring-[var(--color-border)] sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] md:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] text-indigo-600 ring-1 ring-inset ring-[var(--color-border)] dark:text-indigo-300">
              <Languages className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h4 className="text-[13px] font-semibold text-[var(--color-text-main)]">{translate(currentLanguage, 'settings.language.title')}</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-sub)]">{translate(currentLanguage, 'settings.language.subtitle')}</p>
            </div>
          </div>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={languageMenuOpen}
              onClick={() => setLanguageMenuOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-xl bg-[var(--color-surface)] px-3 py-2.5 text-left ring-1 ring-inset ring-[var(--color-border)] transition hover:ring-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-bold text-white">
                {selectedLanguage.backendValue}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--color-text-main)]">{selectedLanguage.nativeName}</span>
                <span className="block truncate text-[11px] text-[var(--color-text-sub)]">{selectedLanguage.displayName}</span>
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {languageMenuOpen && (
              <div
                role="listbox"
                aria-label={translate(currentLanguage, 'settings.language.title')}
                className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl shadow-slate-950/10 dark:shadow-black/30"
              >
                {LANGUAGE_OPTIONS.map((language) => {
                  const isActive = currentLanguage === language.id;
                  return (
                    <button
                      key={language.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        onUpdate({ language: language.id });
                        setLanguageMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-400/10' : 'hover:bg-[var(--color-surface-container)]'}`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${isActive ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-container)] text-[var(--color-text-sub)]'}`}>
                        {language.backendValue}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-[var(--color-text-main)]">{language.nativeName}</span>
                        <span className="block truncate text-[10px] text-[var(--color-text-sub)]">{language.displayName}</span>
                      </span>
                      {isActive && <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-300" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-h-[148px] flex-col justify-between rounded-2xl bg-[var(--color-canvas)] p-4 ring-1 ring-inset ring-[var(--color-border)] sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-text-sub)] ring-1 ring-inset ring-[var(--color-border)]">
              <Save className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h4 className="text-[13px] font-semibold text-[var(--color-text-main)]">{translate(currentLanguage, 'settings.autosave.title')}</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-sub)]">{translate(currentLanguage, 'settings.autosave.subtitle')}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end border-t border-[var(--color-border)] pt-3">
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoSaveDrafts}
              onClick={() => onUpdate({ autoSaveDrafts: !settings.autoSaveDrafts })}
              className={`settings-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${settings.autoSaveDrafts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`settings-switch-thumb pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${settings.autoSaveDrafts ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
