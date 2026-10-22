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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)]"
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
                  'relative flex flex-col items-center justify-center gap-1 h-full w-full py-1 transition-all select-none group',
                  tab.active ? 'text-[#4F46E5]' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {tab.active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#4F46E5] shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                )}
                <span
                  className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200',
                    tab.active
                      ? 'bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-md shadow-indigo-500/25 scale-105'
                      : 'text-slate-500 group-hover:bg-slate-100/80 group-active:scale-95'
                  )}
                >
                  <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
                </span>
                <span className={clsx('text-[10px] leading-tight truncate max-w-[62px] tracking-tight', tab.active ? 'font-bold' : 'font-medium')}>
                  {tab.label}
                </span>
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
              'relative flex flex-col items-center justify-center gap-1 h-full w-full py-1 transition-all select-none group',
              isDrawerActive && !primaryTabs.some((t) => t.active) ? 'text-[#4F46E5]' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {isDrawerActive && !primaryTabs.some((t) => t.active) && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#4F46E5] shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
            )}
            <span
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 relative',
                isDrawerOpen || (isDrawerActive && !primaryTabs.some((t) => t.active))
                  ? 'bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-500 group-hover:bg-slate-100/80 group-active:scale-95'
              )}
            >
              <MenuIcon className="w-4.5 h-4.5 stroke-[2.2]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-[#F43F5E] ring-2 ring-white animate-pulse" />
              )}
            </span>
            <span className={clsx('text-[10px] leading-tight truncate max-w-[62px] tracking-tight', isDrawerActive && !primaryTabs.some(t => t.active) ? 'font-bold' : 'font-medium')}>
              {getMultiLangText(language, { vi: 'Thêm', en: 'More', ja: 'メニュー', ko: '더보기', zh: '更多', fr: 'Plus', de: 'Mehr', es: 'Más' })}
            </span>
          </button>
        </div>
      </nav>

      {/* Expanded Menu Drawer (Bottom Sheet on Mobile) */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div
            role="dialog"
            aria-label="Menu chức năng Planora"
            className="relative z-10 w-full max-h-[88vh] bg-white rounded-t-[2rem] border-t border-slate-200/80 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-250 pb-[env(safe-area-inset-bottom,0.75rem)]"
          >
            {/* Sheet Handle & Header */}
            <div className="flex flex-col items-center pt-3 pb-3 px-5 border-b border-slate-100 shrink-0 bg-slate-50/60">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 mb-3" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Logo size="sm" showText theme="light" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Menu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs active:scale-95"
                  aria-label="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Profile Summary Card */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  />
                ) : (
                  <span className="flex w-11 h-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-sm font-extrabold text-white shadow-md">
                    {user?.name?.[0]?.toUpperCase() || 'P'}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Người dùng Planora'}</p>
                  <p className="text-[11px] text-indigo-200/80 truncate font-mono">{user?.email || 'user@planora.vn'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openLogoutModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-rose-500/80 border border-white/15 text-rose-200 hover:text-white transition-all shrink-0 active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{getMultiLangText(language, { vi: 'Thoát', en: 'Exit', ja: 'ログアウト', ko: '로그아웃', zh: '退出', fr: 'Sortir', de: 'Beenden', es: 'Salir' })}</span>
              </button>
            </div>

            {/* Menu Items Grid & Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Feature Grid */}
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                  {getMultiLangText(language, { vi: 'Chức năng & Tiện ích', en: 'Features & Utilities', ja: '機能とツール', ko: '기능 및 유틸리티', zh: '功能与工具', fr: 'Fonctionnalités', de: 'Funktionen', es: 'Herramientas' })}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {drawerItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to || (item.to.includes('?') && location.pathname + location.search === item.to);
                    return (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => handleNavigate(item.to)}
                        className={clsx(
                          'group relative flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-150 border select-none cursor-pointer',
                          isActive
                            ? 'bg-gradient-to-tr from-indigo-50 to-violet-50 text-indigo-700 border-indigo-200 shadow-sm ring-1 ring-indigo-500/20'
                            : 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-200 hover:bg-slate-50/80 active:scale-95 shadow-xs'
                        )}
                      >
                        <span
                          className={clsx(
                            'flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-transform group-hover:scale-105',
                            isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-100/60'
                          )}
                        >
                          <Icon className="w-4.5 h-4.5 stroke-[2]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold leading-tight">{item.label}</span>
                          <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-medium">Mở trang</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F43F5E] text-white shadow-xs">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All Navigation Links / Primary Views */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  {getMultiLangText(language, { vi: 'Trang chính Planora', en: 'Main workspaces', ja: 'メインワークスペース', ko: '주요 작업 공간', zh: '主要工作区', fr: 'Espaces principaux', de: 'Hauptarbeitsbereiche', es: 'Espacios principales' })}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {primaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.to}
                        type="button"
                        onClick={() => handleNavigate(tab.to)}
                        className={clsx(
                          'flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all border',
                          tab.active
                            ? 'text-indigo-700 bg-indigo-50/90 border-indigo-200 shadow-xs'
                            : 'text-slate-600 bg-slate-50/60 border-slate-200/60 hover:bg-slate-100/80 hover:text-slate-900 active:scale-95'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={clsx('w-4 h-4 shrink-0', tab.active ? 'text-indigo-600' : 'text-slate-500')} />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
