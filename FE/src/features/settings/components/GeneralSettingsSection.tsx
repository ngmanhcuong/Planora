import React from 'react';
import { Sliders } from 'lucide-react';
import type { UserSettingsState } from '../types';

export interface GeneralSettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => void;
}

export const GeneralSettingsSection: React.FC<GeneralSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
      <div className="border-b border-[#F1F5F9] pb-4">
        <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#4F46E5]" />
          Cài đặt hệ thống & Ngôn ngữ
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Quản lý ngôn ngữ hiển thị và hành vi mặc định của ứng dụng.
        </p>
      </div>

      {/* Language */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F1F5F9]">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#131B2E]">Ngôn ngữ hiển thị</span>
          <span className="text-xs text-[#64748B]">Chọn ngôn ngữ chính cho toàn bộ giao diện</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'vi', label: 'Tiếng Việt 🇻🇳' },
            { id: 'en', label: 'English 🇺🇸' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => onUpdate({ language: lang.id as any })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                settings.language === lang.id
                  ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#EEF2FF]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto Save */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#131B2E]">Tự động lưu bản nháp</span>
          <span className="text-xs text-[#64748B]">Tự động lưu thông tin đang nhập trong biểu mẫu</span>
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
    </div>
  );
};
