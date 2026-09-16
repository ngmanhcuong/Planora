import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { UserSettingsState } from '../types';

import { useChangePassword } from '../hooks/useSettings';

export interface SecuritySettingsProps {
  settings: UserSettingsState;
  onUpdate: (updated: Partial<UserSettingsState>) => void;
}

export const SecuritySettingsSection: React.FC<SecuritySettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  const changePasswordMutation = useChangePassword();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPassError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Mật khẩu xác nhận không khớp');
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
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.';
      setPassError(msg);
    }
  };

  return (
    <section className="flex flex-col gap-6 p-6 border-b border-[#E2E8F0]">
      <div className="border-b border-[#F1F5F9] pb-4">
        <h3 className="text-base font-bold text-[#131B2E] font-heading flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#4F46E5]" />
          Bảo mật & Quản lý tài khoản
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Đổi mật khẩu và tăng cường bảo mật cho tài khoản cá nhân.
        </p>
      </div>

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 border-b border-[#F1F5F9] pb-6">
        <h4 className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">Đổi mật khẩu</h4>

        {passSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Đổi mật khẩu thành công!</span>
          </div>
        )}

        {passError && (
          <div className="text-xs font-semibold text-[#BA1A1A] bg-[#FFDAD6] p-2.5 rounded-lg border border-[#F43F5E]">
            {passError}
          </div>
        )}

        <Input
          label="Mật khẩu hiện tại"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<KeyRound className="w-4 h-4" />}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<KeyRound className="w-4 h-4" />}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm">
            <span>Cập nhật mật khẩu</span>
          </Button>
        </div>
      </form>

      {/* 2FA Toggle */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-[#F1F5F9]">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#131B2E]">Xác thực 2 yếu tố (2FA)</span>
          <span className="text-xs text-[#64748B]">Yêu cầu mã xác thực OTP khi đăng nhập từ thiết bị mới</span>
        </div>
        <button
          onClick={() => onUpdate({ twoFactorAuth: !settings.twoFactorAuth })}
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
          <span className="text-xs font-bold text-[#131B2E]">Cảnh báo đăng nhập lạ</span>
          <span className="text-xs text-[#64748B]">Gửi email cảnh báo khi có vị trí đăng nhập bất thường</span>
        </div>
        <button
          onClick={() => onUpdate({ loginAlerts: !settings.loginAlerts })}
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
    </section>
  );
};
