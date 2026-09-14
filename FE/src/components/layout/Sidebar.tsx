import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { clsx } from 'clsx';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/calendar', label: 'Lịch của tôi', icon: <CalendarIcon className="w-5 h-5" /> },
  { to: '/timetable', label: 'Thời khóa biểu', icon: <Clock className="w-5 h-5" /> },
  { to: '/tasks', label: 'Công việc', icon: <CheckSquare className="w-5 h-5" /> },
  { to: '/profile', label: 'Hồ sơ cá nhân', icon: <User className="w-5 h-5" /> },
  { to: '/settings', label: 'Cài đặt', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 bottom-0 z-30 bg-white border-r border-[#E2E8F0] flex flex-col transition-all duration-300 ease-in-out select-none',
        isSidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
            P
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[#131B2E] tracking-tight leading-none font-heading">
                Planora
              </span>
              <span className="text-[11px] text-[#4F46E5] font-semibold tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Schedule AI
              </span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
          title={isSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative group',
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#131B2E]'
              )
            }
            title={isSidebarCollapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <span className={clsx('shrink-0 transition-transform duration-150', isActive && 'scale-110')}>
                  {item.icon}
                </span>
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && (
                  <span className="absolute right-0 top-2 bottom-2 w-1 bg-[#4F46E5] rounded-l-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Banner */}
      {!isSidebarCollapsed && (
        <div className="p-4 m-3 bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-xl border border-[#C7D2FE]/50 text-xs text-[#3730A3]">
          <p className="font-semibold text-sm mb-1 text-[#1E1B4B]">Planora Pro</p>
          <p className="text-[#4338CA] mb-2 leading-relaxed">Tự động tối ưu hóa lịch học & công việc của bạn.</p>
        </div>
      )}
    </aside>
  );
};
