import React from 'react';
import { Bell, Search } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useUIStore } from '@/stores/useUIStore';
import { useUnreadCount } from './hooks/useNotifications';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const { isSidebarCollapsed } = useUIStore();
  const { data: unreadData } = useUnreadCount();

  const unreadCount = typeof unreadData === 'number' ? unreadData : 0;

  return (
    <header
      className={clsx(
        'fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] z-20 flex items-center justify-between px-6 transition-all duration-300 ease-in-out',
        isSidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      {/* Search Input */}
      <div className="relative w-72 max-w-xs">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Tìm kiếm công việc, môn học, lịch trình..."
          className="w-full h-9 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#131B2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
        />
      </div>

      {/* Right Action Icons & User Menu */}
      <div className="flex items-center gap-4">
        <button
          className="relative p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors"
          title="Thông báo"
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

