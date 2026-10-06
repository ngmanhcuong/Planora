import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, CheckCircle2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { normalizeLanguage, translate } from '@/lib/i18n';
import type { UserSettingsState } from '../types';

import { useChangePassword } from '../hooks/useSettings';
import { useAuthStore } from '@/stores/useAuthStore';

export interface SecuritySettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => Promise<void> | void;
}

export const SecuritySettingsSection: React.FC<SecuritySettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const language = normalizeLanguage(settings.language);
  const currentUser = useAuthStore((state) => state.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const changePasswordMutation = useChangePassword();

  const updateSecuritySetting = async (updated: Partial<UserSettingsState>) => {
    setSecurityMessage(null);
    try {
      await onUpdate(updated);
      setSecurityMessage({ type: 'success', text: 'Đã lưu thiết lập bảo mật vào tài khoản.' });
    } catch (error: any) {
      setSecurityMessage({
        type: 'error',
        text: error.response?.data?.message || 'Không thể lưu thiết lập bảo mật.',
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPassError(translate(language, 'settings.security.password.error.currentRequired'));
      return;
    }
    if (newPassword.length < 8) {
      setPassError(translate(language, 'settings.security.password.error.minLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError(translate(language, 'settings.security.password.error.mismatch'));
      return;
    }

    setPassError('');
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword, confirmPassword });
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || translate(language, 'settings.security.password.error.failed');
      setPassError(msg);
    }
  };

  return (
    <section className={`flex flex-col p-6 border-b border-[#E2E8F0] ${isCollapsed ? '' : 'gap-6'}`}>
      <div className={`flex items-center justify-between gap-4 ${isCollapsed ? '' : 'border-b border-[#F1F5F9] pb-4'}`}>
        <div>
          <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#4F46E5]" />
            {translate(language, 'settings.security.title')}
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {translate(language, 'settings.security.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((value) => !value)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Mở rộng cài đặt bảo mật' : 'Thu gọn cài đặt bảo mật'}
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-sub)] transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300"
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-1 duration-200">

      {/* Password Form */}
      <form
        onSubmit={handlePasswordSubmit}
        autoComplete="off"
        className="flex flex-col gap-4 border-b border-[#F1F5F9] pb-6"
      >
        <input
          type="text"
          name="username"
          value={currentUser?.email || ''}
          autoComplete="username"
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />
        <h4 className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">
          {translate(language, 'settings.security.password.title')}
        </h4>

        {passSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{translate(language, 'settings.security.password.success')}</span>
          </div>
        )}

        {passError && (
          <div className="text-xs font-semibold text-[#BA1A1A] bg-[#FFDAD6] p-2.5 rounded-lg border border-[#F43F5E]">
            {passError}
          </div>
        )}

        <Input
          label={translate(language, 'settings.security.password.current')}
          type="password"
          name={`planora-current-password-${currentUser?.id || 'user'}`}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={translate(language, 'settings.security.password.new')}
            type="password"
            name="new-password"
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<KeyRound className="w-4 h-4" />}
          />

          <Input
            label={translate(language, 'settings.security.password.confirm')}
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<KeyRound className="w-4 h-4" />}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" disabled={changePasswordMutation.isPending}>
            <span>{translate(language, 'settings.security.password.update')}</span>
          </Button>
        </div>
      </form>

      {/* 2FA Toggle */}
      {securityMessage && (
        <div className={`rounded-lg border p-2.5 text-xs font-semibold ${securityMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {securityMessage.text}
        </div>
      )}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F1F5F9]">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#131B2E]">{translate(language, 'settings.security.twoFactor.title')}</span>
          <span className="text-xs text-[#64748B]">{translate(language, 'settings.security.twoFactor.subtitle')}</span>
        </div>
        <button
          onClick={() => updateSecuritySetting({ twoFactorAuth: !settings.twoFactorAuth })}
          className={`settings-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            settings.twoFactorAuth ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]'
          }`}
        >
          <span
            className={`settings-switch-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              settings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Login Alerts */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#131B2E]">{translate(language, 'settings.security.loginAlerts.title')}</span>
          <span className="text-xs text-[#64748B]">{translate(language, 'settings.security.loginAlerts.subtitle')}</span>
        </div>
        <button
          onClick={() => updateSecuritySetting({ loginAlerts: !settings.loginAlerts })}
          className={`settings-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            settings.loginAlerts ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]'
          }`}
        >
          <span
            className={`settings-switch-thumb pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              settings.loginAlerts ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
        </div>
      )}
    </section>
  );
};
