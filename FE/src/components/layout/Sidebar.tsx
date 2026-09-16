import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  BarChart3,
  Bot,
  NotebookPen,
  Target,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { clsx } from 'clsx';
import { Logo } from '@/components/ui/Logo';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { normalizeLanguage, translate, type TranslationKey } from '@/lib/i18n';

interface NavItem {
  to: string;
  labelKey: TranslationKey;
  icon: React.ReactNode;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'sidebar.dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/calendar', labelKey: 'sidebar.calendar', icon: <CalendarIcon className="w-5 h-5" /> },
  { to: '/timetable', labelKey: 'sidebar.timetable', icon: <Clock className="w-5 h-5" /> },
  { to: '/tasks', labelKey: 'sidebar.tasks', icon: <CheckSquare className="w-5 h-5" /> },
  { to: '/assistant', labelKey: 'sidebar.assistant', icon: <Bot className="w-5 h-5" /> },
  { to: '/goals', labelKey: 'sidebar.goals', icon: <Target className="w-5 h-5" /> },
  { to: '/notes', labelKey: 'sidebar.notes', icon: <NotebookPen className="w-5 h-5" /> },
  { to: '/reports', labelKey: 'sidebar.reports', icon: <BarChart3 className="w-5 h-5" /> },
];

const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { to: '/profile', labelKey: 'sidebar.profile', icon: <User className="w-5 h-5" /> },
  { to: '/settings', labelKey: 'sidebar.settings', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 bottom-0 z-30 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col transition-all duration-300 ease-in-out select-none',
        isSidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Logo */}
      <div
        className={clsx(
          'relative h-16 flex items-center border-b border-[var(--color-border)]',
          isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4'
        )}
      >
        <div className={clsx('flex items-center gap-3 overflow-hidden', isSidebarCollapsed && 'justify-center')}>
          <Logo size="md" theme="light" showText={!isSidebarCollapsed} />
        </div>

        <button
          onClick={toggleSidebar}
          className={clsx(
            'flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[#64748B] shadow-sm transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]',
            isSidebarCollapsed
              ? 'absolute -right-4 top-1/2 z-40 -translate-y-1/2'
              : 'shrink-0'
          )}
          title={isSidebarCollapsed ? translate(language, 'sidebar.expand') : translate(language, 'sidebar.collapse')}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav
        className={clsx(
          'flex-1 overflow-y-auto py-4',
          isSidebarCollapsed ? 'px-2' : 'px-3'
        )}
      >
        <div className="flex min-h-full flex-col justify-between gap-6">
          <div className="flex flex-col gap-1">
            {MAIN_NAV_ITEMS.map((item) => (
              <SidebarNavLink
                key={item.to}
                item={item}
                language={language}
                collapsed={isSidebarCollapsed}
              />
            ))}
          </div>

          <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-3">
            {ACCOUNT_NAV_ITEMS.map((item) => (
              <SidebarNavLink
                key={item.to}
                item={item}
                language={language}
                collapsed={isSidebarCollapsed}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

const SidebarNavLink: React.FC<{
  item: NavItem;
  language: string;
  collapsed: boolean;
}> = ({ item, language, collapsed }) => {
  const label = translate(language, item.labelKey);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

  return (
    <button
      type="button"
      onClick={() => navigate(item.to)}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'relative flex w-full items-center rounded-2xl text-sm font-semibold transition-all duration-150 group cursor-pointer',
        collapsed ? 'h-11 justify-center px-0' : 'h-11 gap-3 px-3 text-left',
        isActive
          ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-[inset_0_0_0_1px_rgba(79,70,229,0.08)]'
          : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#131B2E]'
      )}
    >
      <span
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-150',
          isActive ? 'bg-white/70 text-[#4F46E5]' : 'text-current group-hover:bg-white/70'
        )}
      >
        {item.icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
      {isActive && !collapsed && (
        <span className="absolute right-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-[#4F46E5]" />
      )}
      {isActive && collapsed && (
        <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-[#4F46E5]" />
      )}
    </button>
  );
};
