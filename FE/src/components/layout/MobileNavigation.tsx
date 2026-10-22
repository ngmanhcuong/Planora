import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  CalendarDays,
  CheckSquare,
  Sparkles,
  Menu as MenuIcon,
  X,
  Target,
  StickyNote,
  BarChart3,
  User,
  Settings,
  Bell,
  ShieldCheck,
  FileText,
  Headphones,
  Users,
  Bot,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useUnreadCount } from './hooks/useNotifications';
import { getMultiLangText, normalizeLanguage } from '@/lib/i18n';
import { clsx } from 'clsx';
import { Logo } from '@/components/ui/Logo';

export const MobileNavigation: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openLogoutModal } = useAuthStore();
  const { data: settings } = useSettings();
  const { data: unreadData } = useUnreadCount();
  const language = normalizeLanguage(settings?.language);

  const unreadCount = typeof unreadData === 'number' ? unreadData : 0;
  const isStaffOrAdmin = ['ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD'].includes(user?.role || '');

  // 4 Primary items + 1 Menu item for bottom nav
  const primaryTabs = isStaffOrAdmin
    ? [
        {
          to: '/admin?tab=users',
          label: getMultiLangText(language, { vi: 'Hệ thống', en: 'System', ja: 'システム', ko: '시스템', zh: '系统', fr: 'Système', de: 'System', es: 'Sistema' }),
          icon: ShieldCheck,
          active: location.pathname === '/admin' && (!location.search || location.search.includes('users')),
        },
        {
          to: '/admin?tab=content',
          label: getMultiLangText(language, { vi: 'Nội dung', en: 'Content', ja: 'コンテンツ', ko: '콘텐츠', zh: '内容', fr: 'Contenu', de: 'Inhalte', es: 'Contenido' }),
          icon: FileText,
          active: location.search.includes('content'),
        },
        {
          to: '/admin?tab=support',
          label: getMultiLangText(language, { vi: 'Hỗ trợ', en: 'Support', ja: 'サポート', ko: '지원', zh: '支持', fr: 'Support', de: 'Support', es: 'Soporte' }),
          icon: Headphones,
          active: location.search.includes('support'),
        },
        {
          to: '/admin?tab=system',
          label: getMultiLangText(language, { vi: 'AI Auto', en: 'AI Auto', ja: 'AI自動', ko: 'AI 자동', zh: 'AI 自动', fr: 'IA auto', de: 'KI Auto', es: 'IA auto' }),
          icon: Bot,
          active: location.search.includes('system'),
        },
      ]
    : [
        {
          to: '/dashboard',
          label: getMultiLangText(language, { vi: 'Tổng quan', en: 'Overview', ja: '概要', ko: '개요', zh: '概览', fr: 'Aperçu', de: 'Übersicht', es: 'Inicio' }),
          icon: LayoutGrid,
          active: location.pathname === '/dashboard',
        },
        {
          to: '/schedule',
          label: getMultiLangText(language, { vi: 'Lịch biểu', en: 'Schedule', ja: '予定', ko: '일정', zh: '日程', fr: 'Planning', de: 'Zeitplan', es: 'Agenda' }),
          icon: CalendarDays,
          active: ['/schedule', '/calendar', '/timetable'].includes(location.pathname),
        },
        {
          to: '/tasks',
          label: getMultiLangText(language, { vi: 'Công việc', en: 'Tasks', ja: 'タスク', ko: '작업', zh: '任务', fr: 'Tâches', de: 'Aufgaben', es: 'Tareas' }),
          icon: CheckSquare,
          active: location.pathname === '/tasks',
        },
        {
          to: '/assistant',
          label: getMultiLangText(language, { vi: 'Trợ lý AI', en: 'AI Assistant', ja: 'AIアシスト', ko: 'AI 비서', zh: 'AI 助手', fr: 'Assistant IA', de: 'KI-Assistent', es: 'Asistente IA' }),
          icon: Sparkles,
          active: location.pathname === '/assistant',
        },
      ];

  // Drawer extra navigation items
  const drawerItems = isStaffOrAdmin
    ? [
        {
          to: '/admin?tab=team',
          label: getMultiLangText(language, { vi: 'Doanh nghiệp', en: 'Enterprise', ja: '法人', ko: '기업', zh: '企业', fr: 'Entreprise', de: 'Enterprise', es: 'Empresa' }),
          icon: Users,
        },
        {
          to: '/settings',
          label: getMultiLangText(language, { vi: 'Cài đặt hệ thống', en: 'Settings', ja: '設定', ko: '설정', zh: '设置', fr: 'Paramètres', de: 'Einstellungen', es: 'Configuración' }),
          icon: Settings,
        },
      ]
    : [
        {
          to: '/notifications',
          label: getMultiLangText(language, { vi: 'Thông báo', en: 'Notifications', ja: '通知', ko: '알림', zh: '通知', fr: 'Notifications', de: 'Benachrichtigungen', es: 'Notificaciones' }),
          icon: Bell,
          badge: unreadCount,
        },
        {
          to: '/goals',
          label: getMultiLangText(language, { vi: 'Mục tiêu & KPI', en: 'Goals & KPI', ja: '目標', ko: '목표', zh: '目标', fr: 'Objectifs', de: 'Ziele', es: 'Objetivos' }),
          icon: Target,
        },
        {
          to: '/notes',
          label: getMultiLangText(language, { vi: 'Ghi chú nhanh', en: 'Quick Notes', ja: 'ノート', ko: '노트', zh: '笔记', fr: 'Notes', de: 'Notizen', es: 'Notas' }),
          icon: StickyNote,
        },
        {
          to: '/reports',
          label: getMultiLangText(language, { vi: 'Báo cáo & Thống kê', en: 'Reports & Stats', ja: 'レポート', ko: '보고서', zh: '报告', fr: 'Rapports', de: 'Berichte', es: 'Informes' }),
          icon: BarChart3,
        },
        {
          to: '/profile',
          label: getMultiLangText(language, { vi: 'Hồ sơ cá nhân', en: 'My Profile', ja: 'プロフィール', ko: '프로필', zh: '个人资料', fr: 'Profil', de: 'Profil', es: 'Perfil' }),
          icon: User,
        },
        {
          to: '/settings',
          label: getMultiLangText(language, { vi: 'Cài đặt ứng dụng', en: 'Settings', ja: '設定', ko: '설정', zh: '设置', fr: 'Paramètres', de: 'Einstellungen', es: 'Configuración' }),
          icon: Settings,
        },
      ];

  const handleNavigate = (path: string) => {
    setIsDrawerOpen(false);
    navigate(path);
  };

  const isDrawerActive = !primaryTabs.some((tab) => tab.active);

  return (
    <>
      {/* Bottom Navigation Bar (Visible only on mobile/tablet < 1024px) */}
      <nav
        aria-label="Thanh điều hướng dưới"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-center">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.to}
                type="button"
                onClick={() => handleNavigate(tab.to)}
                aria-current={tab.active ? 'page' : undefined}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 h-full w-full py-1 transition-colors select-none group',
                  tab.active ? 'text-[#4F46E5] font-bold' : 'text-[#64748B] hover:text-[#131B2E]'
                )}
              >
                <span
                  className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-xl transition-all',
                    tab.active ? 'bg-[#EEF2FF] text-[#4F46E5] scale-105 shadow-xs' : 'group-active:scale-95'
                  )}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </span>
                <span className="text-[10px] leading-tight truncate max-w-[62px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}

          {/* Menu Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-label="Mở menu mở rộng"
            className={clsx(
              'flex flex-col items-center justify-center gap-1 h-full w-full py-1 transition-colors select-none group relative',
              isDrawerActive && !primaryTabs.some(t => t.active) ? 'text-[#4F46E5] font-bold' : 'text-[#64748B] hover:text-[#131B2E]'
            )}
          >
            <span
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-xl transition-all relative',
                isDrawerOpen ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'group-active:scale-95'
              )}
            >
              <MenuIcon className="w-5 h-5 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-[#F43F5E] ring-2 ring-white" />
              )}
            </span>
            <span className="text-[10px] leading-tight truncate max-w-[62px] tracking-tight">
              {getMultiLangText(language, { vi: 'Thêm', en: 'More', ja: 'メニュー', ko: '더보기', zh: '更多', fr: 'Plus', de: 'Mehr', es: 'Más' })}
            </span>
          </button>
        </div>
      </nav>

      {/* Expanded Menu Drawer (Bottom Sheet / Side Drawer on Mobile) */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div
            role="dialog"
            aria-label="Menu chức năng Planora"
            className="relative z-10 w-full max-h-[85vh] bg-[var(--color-surface)] rounded-t-[1.75rem] border-t border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-250 pb-[env(safe-area-inset-bottom,0.75rem)]"
          >
            {/* Sheet Handle & Header */}
            <div className="flex flex-col items-center pt-3 pb-2 px-5 border-b border-[var(--color-border)] shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300 mb-3" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <Logo size="sm" showText theme="light" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User Quick Info */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                  />
                ) : (
                  <span className="flex w-10 h-10 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-bold text-[#4F46E5]">
                    {user?.name?.[0]?.toUpperCase() || 'P'}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Người dùng Planora'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@planora.vn'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openLogoutModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{getMultiLangText(language, { vi: 'Thoát', en: 'Exit', ja: 'ログアウト', ko: '로그아웃', zh: '退出', fr: 'Sortir', de: 'Beenden', es: 'Salir' })}</span>
              </button>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-100">
              <div className="grid grid-cols-2 gap-2 pb-3">
                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || (item.to.includes('?') && location.pathname + location.search === item.to);
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => handleNavigate(item.to)}
                      className={clsx(
                        'flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all border text-xs font-semibold select-none cursor-pointer',
                        isActive
                          ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <span
                        className={clsx(
                          'flex items-center justify-center w-8 h-8 rounded-xl shrink-0',
                          isActive ? 'bg-white text-[#4F46E5] shadow-xs' : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="truncate flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F43F5E] text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick links to primary pages if needed */}
              <div className="pt-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  {getMultiLangText(language, { vi: 'Trang chính', en: 'Main views', ja: 'メインビュー', ko: '주요 화면', zh: '主要页面', fr: 'Vues principales', de: 'Hauptansichten', es: 'Vistas principales' })}
                </p>
                <div className="flex flex-col gap-1">
                  {primaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.to}
                        type="button"
                        onClick={() => handleNavigate(tab.to)}
                        className={clsx(
                          'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                          tab.active ? 'text-indigo-600 bg-indigo-50/70 font-bold' : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
