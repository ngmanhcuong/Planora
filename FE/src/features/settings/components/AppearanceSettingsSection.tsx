import React from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import type { UserSettingsState } from '../types';

export interface AppearanceSettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => void;
}

export const AppearanceSettingsSection: React.FC<AppearanceSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const themes: { id: 'light' | 'dark' | 'system'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: 'Giao diện Sáng', icon: Sun },
    { id: 'dark', label: 'Giao diện Tối', icon: Moon },
    { id: 'system', label: 'Theo hệ thống', icon: Monitor },
  ];

  return (
    <section className="flex flex-col gap-6 p-6">
      <div className="border-b border-[#F1F5F9] pb-4">
        <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#4F46E5]" />
          Giao diện & Tùy biến chủ đề
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Tùy chọn chế độ màu sắc và phong cách hiển thị cho ứng dụng Planora.
        </p>
      </div>

      {/* Theme Picker */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-[#131B2E]">Chế độ giao diện (Theme)</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = settings.theme === t.id;

            return (
              <button
                key={t.id}
                type="button"
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

      {/* Brand Color Theme Palette Preview */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#F1F5F9]">
        <span className="text-xs font-bold text-[#131B2E]">Màu sắc thương hiệu Planora</span>
        <div className="flex items-center gap-3">
          {[
            { name: 'Indigo Signature', hex: '#4F46E5' },
            { name: 'Deep Blue', hex: '#0058BE' },
            { name: 'Teal Forest', hex: '#006E4B' },
            { name: 'Rose Red', hex: '#BA1A1A' },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#131B2E]">
              <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
