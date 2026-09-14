import React from 'react';
import { Sliders, Bell, ShieldCheck, Palette } from 'lucide-react';
import type { SettingsTab } from '../types';

export interface SettingsNavTabsProps {
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
}

export const SettingsNavTabs: React.FC<SettingsNavTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'general', label: 'Cài đặt chung', icon: Sliders },
    { id: 'notifications', label: 'Thông báo & Nhắc nhở', icon: Bell },
    { id: 'security', label: 'Bảo mật & Tài khoản', icon: ShieldCheck },
    { id: 'appearance', label: 'Giao diện & Chủ đề', icon: Palette },
  ];

  return (
    <div className="flex items-center gap-1 bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F0] overflow-x-auto w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-white text-[#4F46E5] shadow-xs font-bold'
                : 'text-[#64748B] hover:text-[#131B2E] hover:bg-white/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-[#64748B]'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
