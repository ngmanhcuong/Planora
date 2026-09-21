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
  const initials = user?.name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'P';

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
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F1F5F9] transition-colors focus:outline-none"
      >
        {user?.avatarUrl && brokenAvatar !== user.avatarUrl ? <img
          src={user.avatarUrl}
          alt={user?.name || getMultiLangText(language, { vi: 'Ảnh đại diện người dùng', en: 'User avatar', ja: 'ユーザーアバター', ko: '사용자 아바타', zh: '用户头像', fr: 'Avatar utilisateur', de: 'Benutzeravatar', es: 'Avatar de usuario' })}
          className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]"
          onError={() => setBrokenAvatar(user.avatarUrl || null)}
        /> : <span className="flex w-9 h-9 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-bold text-[#4F46E5]">{initials}</span>}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-[#131B2E] truncate max-w-[120px]">{user?.name || getMultiLangText(language, { vi: 'Tài khoản', en: 'Account', ja: 'アカウント', ko: '계정', zh: '账户', fr: 'Compte', de: 'Konto', es: 'Cuenta' })}</span>
          <span className="text-[10px] text-[#64748B] truncate max-w-[120px]">{user?.email || 'user@planora.vn'}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-[#64748B] hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_4px_12px_-2px_rgba(15,23,42,0.08)] border border-[#E2E8F0] py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 border-b border-[#E2E8F0] sm:hidden">
            <p className="text-xs font-bold text-[#131B2E]">{user?.name}</p>
            <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/profile');
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#131B2E] hover:bg-[#F8FAFC] transition-colors"
          >
            <UserIcon className="w-4 h-4 text-[#64748B]" />
            {getMultiLangText(language, { vi: 'Hồ sơ cá nhân', en: 'Profile', ja: 'プロフィール', ko: '프로필', zh: '个人资料', fr: 'Profil', de: 'Profil', es: 'Perfil' })}
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/settings');
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#131B2E] hover:bg-[#F8FAFC] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#64748B]" />
            {getMultiLangText(language, { vi: 'Cài đặt tài khoản', en: 'Account settings', ja: 'アカウント設定', ko: '계정 설정', zh: '账户设置', fr: 'Paramètres du compte', de: 'Kontoeinstellungen', es: 'Configuración de cuenta' })}
          </button>

          <div className="my-1 border-t border-[#E2E8F0]" />

          <button
            onClick={() => {
              setIsOpen(false);
              openLogoutModal();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#F43F5E] hover:bg-[#FFF1F2] transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#F43F5E]" />
            {getMultiLangText(language, { vi: 'Đăng xuất', en: 'Sign out', ja: 'ログアウト', ko: '로그아웃', zh: '退出登录', fr: 'Déconnexion', de: 'Abmelden', es: 'Cerrar sesión' })}
          </button>
        </div>
      )}
    </div>
  );
};
