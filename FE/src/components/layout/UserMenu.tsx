import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { getMultiLangText, normalizeLanguage } from '@/lib/i18n';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, openLogoutModal } = useAuthStore();
  const [brokenAvatar, setBrokenAvatar] = useState<string | null>(null);
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);
  const initials =
    user?.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'P';
  const isStaffOrAdmin = ['ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD'].includes(
    user?.role || ''
  );

  useEffect(() => {
    setBrokenAvatar(null);
  }, [user?.avatarUrl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
        aria-label="Menu tài khoản người dùng"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {user?.avatarUrl && brokenAvatar !== user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user?.name || 'Avatar'}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              onError={() => setBrokenAvatar(user.avatarUrl || null)}
            />
          ) : (
            <span className="flex w-9 h-9 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 shadow-xs">
              {initials}
            </span>
          )}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-xs" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
            {user?.name || getMultiLangText(language, { vi: 'Tài khoản', en: 'Account' })}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
            {user?.email || 'user@planora.vn'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="py-1">
            {!isStaffOrAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                {getMultiLangText(language, {
                  vi: 'Hồ sơ cá nhân',
                  en: 'Profile',
                  ja: 'プロフィール',
                  ko: '프로필',
                  zh: '个人资料',
                  fr: 'Profil',
                  de: 'Profil',
                  es: 'Perfil',
                })}
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              {getMultiLangText(language, {
                vi: 'Cài đặt tài khoản',
                en: 'Account settings',
                ja: 'アカウント設定',
                ko: '계정 설정',
                zh: '账户设置',
                fr: 'Paramètres du compte',
                de: 'Kontoeinstellungen',
                es: 'Configuración de cuenta',
              })}
            </button>
          </div>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            onClick={() => {
              setIsOpen(false);
              openLogoutModal();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            {getMultiLangText(language, {
              vi: 'Đăng xuất',
              en: 'Sign out',
              ja: 'ログアウト',
              ko: '로그아웃',
              zh: '退出登录',
              fr: 'Déconnexion',
              de: 'Abmelden',
              es: 'Cerrar sesión',
            })}
          </button>
        </div>
      )}
    </div>
  );
};
