import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Calendar as CalendarIcon,
  CalendarClock,
  CheckSquare,
  BarChart3,
  Sparkles,
  StickyNote,
  Target,
  User,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  Headphones,
  Users,
  Bot,
} from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { clsx } from 'clsx';
import { Logo } from '@/components/ui/Logo';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useUnreadCount } from './hooks/useNotifications';
import { getMultiLangText, normalizeLanguage, translate, type TranslationKey } from '@/lib/i18n';
import { useAuthStore } from '@/stores/useAuthStore';

interface NavItem {
  to: string;
  labelKey?: TranslationKey;
  label?: string;
  labelMap?: { vi: string; en: string; ja?: string; ko?: string; zh?: string; fr?: string; de?: string; es?: string };
  icon: React.ReactNode;
  badge?: number;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'sidebar.dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
  { to: '/calendar', labelKey: 'sidebar.calendar', icon: <CalendarIcon className="w-5 h-5" /> },
  { to: '/timetable', labelKey: 'sidebar.timetable', icon: <CalendarClock className="w-5 h-5" /> },
  { to: '/tasks', labelKey: 'sidebar.tasks', icon: <CheckSquare className="w-5 h-5" /> },
  { to: '/notifications', labelKey: 'sidebar.notifications', icon: <Bell className="w-5 h-5" /> },
  { to: '/assistant', labelKey: 'sidebar.assistant', icon: <Sparkles className="w-5 h-5" /> },
  { to: '/goals', labelKey: 'sidebar.goals', icon: <Target className="w-5 h-5" /> },
  { to: '/notes', labelKey: 'sidebar.notes', icon: <StickyNote className="w-5 h-5" /> },
  { to: '/reports', labelKey: 'sidebar.reports', icon: <BarChart3 className="w-5 h-5" /> },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: '/admin?tab=users', labelMap: { vi: 'Hệ Thống', en: 'System', ja: 'システム', ko: '시스템', zh: '系统', fr: 'Système', de: 'System', es: 'Sistema' }, icon: <ShieldCheck className="w-5 h-5" /> },
  { to: '/admin?tab=content', labelMap: { vi: 'Nội Dung', en: 'Content', ja: 'コンテンツ', ko: '콘텐츠', zh: '内容', fr: 'Contenu', de: 'Inhalte', es: 'Contenido' }, icon: <FileText className="w-5 h-5" /> },
  { to: '/admin?tab=support', labelMap: { vi: 'Hỗ Trợ', en: 'Support', ja: 'サポート', ko: '지원', zh: '支持', fr: 'Support', de: 'Support', es: 'Soporte' }, icon: <Headphones className="w-5 h-5" /> },
  { to: '/admin?tab=team', labelMap: { vi: 'Doanh Nghiệp', en: 'Enterprise', ja: '法人', ko: '기업', zh: '企业', fr: 'Entreprise', de: 'Enterprise', es: 'Empresa' }, icon: <Users className="w-5 h-5" /> },
  { to: '/admin?tab=system', labelMap: { vi: 'AI Tự Động', en: 'AI Auto', ja: 'AI自動', ko: 'AI 자동', zh: 'AI 自动', fr: 'IA auto', de: 'KI Auto', es: 'IA auto' }, icon: <Bot className="w-5 h-5" /> },
];

const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { to: '/profile', labelKey: 'sidebar.profile', icon: <User className="w-5 h-5" /> },
  { to: '/settings', labelKey: 'sidebar.settings', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: settings } = useSettings();
  const { data: unreadData } = useUnreadCount();
  const user = useAuthStore((state) => state.user);
  const language = normalizeLanguage(settings?.language);

  const unreadCount = typeof unreadData === 'number' ? unreadData : 0;
  const isStaffOrAdmin = ['ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD'].includes(user?.role || '');
  const mainNavItems = isStaffOrAdmin ? ADMIN_NAV_ITEMS : MAIN_NAV_ITEMS;
  const accountNavItems = isStaffOrAdmin
    ? ACCOUNT_NAV_ITEMS.filter((item) => item.to !== '/profile')
    : ACCOUNT_NAV_ITEMS;

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 bottom-0 z-30 bg-[var(--color-surface)] flex flex-col transition-all duration-300 ease-in-out select-none',
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
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[#64748B] shadow-md shadow-slate-900/10 transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
        aria-label={isSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
      >
        {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Navigation Menu */}
      <nav
        className={clsx(
          'flex-1 overflow-y-auto py-4',
          isSidebarCollapsed ? 'px-2' : 'px-3'
        )}
      >
        <div className="flex min-h-full flex-col justify-between gap-6">
          <div className="flex flex-col gap-1">
            {mainNavItems.map((item) => (
              <SidebarNavLink
                key={item.to}
                item={item}
                language={language}
                collapsed={isSidebarCollapsed}
                badge={!isStaffOrAdmin && item.to === '/notifications' ? unreadCount : item.badge}
              />
            ))}
          </div>

          <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-3">
            {accountNavItems.map((item) => (
              <SidebarNavLink
                key={item.to}
                item={item}
                language={language}
                collapsed={isSidebarCollapsed}
                badge={item.badge}
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
  badge?: number;
}> = ({ item, language, collapsed, badge }) => {
  const label = item.labelMap ? getMultiLangText(language, item.labelMap) : item.label || translate(language, item.labelKey!);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathWithQuery = location.pathname + location.search;
  const isActive =
    location.pathname === item.to ||
    currentPathWithQuery === item.to ||
    (item.to === '/admin?tab=users' && location.pathname === '/admin' && (!location.search || location.search === '?tab=users'));

  return (
    <button
      type="button"
      onClick={() => navigate(item.to)}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'relative flex w-full items-center rounded-2xl text-[13px] leading-5 tracking-[0.01em] transition-all duration-150 group cursor-pointer',
        collapsed ? 'h-11 justify-center px-0' : 'h-11 gap-3 px-3 text-left',
        isActive
          ? 'font-semibold bg-[#EEF2FF] text-[#4F46E5] shadow-[inset_0_0_0_1px_rgba(79,70,229,0.08)]'
          : 'font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#131B2E]'
      )}
    >
      <span
        className={clsx(
          'sidebar-nav-icon relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition-all duration-150 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-[2]',
          isActive
            ? 'sidebar-nav-icon-active border-[#C7D2FE] bg-white text-[#4F46E5] shadow-sm'
            : 'sidebar-nav-icon-idle border-transparent bg-transparent text-[#64748B] group-hover:border-[#E2E8F0] group-hover:bg-white group-hover:text-[#4F46E5]'
        )}
      >
        {item.icon}
        {collapsed && badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F43F5E] px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      {!collapsed && (
        <span className="truncate font-[family-name:var(--font-heading)] flex-1">{label}</span>
      )}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F43F5E] text-white shadow-sm">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {isActive && !collapsed && (
        <span className="absolute right-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-[#4F46E5]" />
      )}
      {isActive && collapsed && (
        <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-[#4F46E5]" />
      )}
    </button>
  );
};



