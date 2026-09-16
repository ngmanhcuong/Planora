import React from 'react';
import { Bell, Search } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useUIStore } from '@/stores/useUIStore';
import { useUnreadCount } from './hooks/useNotifications';
import { clsx } from 'clsx';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { normalizeLanguage, translate } from '@/lib/i18n';

export const Header: React.FC = () => {
  const { isSidebarCollapsed } = useUIStore();
  const { data: unreadData } = useUnreadCount();
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);

  const unreadCount = typeof unreadData === 'number' ? unreadData : 0;

  return (
    <header
      className={clsx(
        'fixed top-0 right-0 h-16 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)] z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 transition-all duration-300 ease-in-out',
        isSidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div aria-hidden="true" />

      {/* Search Input */}
      <div className="relative w-[min(28rem,46vw)] max-w-md justify-self-center">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder={translate(language, 'header.search')}
          className="w-full h-9 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#131B2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
        />
      </div>

      {/* Right Action Icons & User Menu */}
      <div className="flex items-center justify-self-end gap-4">
        <button
          className="relative p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors"
          title={translate(language, 'header.notifications')}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-[#F43F5E] text-white rounded-full ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-[#E2E8F0]" />

        <UserMenu />
      </div>
    </header>
  );
};
