import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AuthLayout } from './components/AuthLayout';
import { loginSchema } from './validations/authSchemas';
import type { LoginFormData } from './types';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/lib/axios';
import type { User } from '@/types';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      if (response.data && response.data.success) {
        const { accessToken, user: apiUser } = response.data.data;
        const user: User = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
          isVerified: apiUser.isVerified,
        };

        setAuth(accessToken, user);
        setIsSubmitting(false);
        navigate('/dashboard');
      } else {
        setAuthError(response.data.message || 'Đăng nhập không thành công.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.';
      setAuthError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      topRightLink={{
        text: 'Chưa có tài khoản?',
        linkText: 'Đăng ký',
        href: '/register',
      }}
    >
      <div className="w-full max-w-[420px]">
        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-8 relative">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50/80 border border-indigo-100/70 mb-3 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#4F46E5] text-white font-bold text-base flex items-center justify-center">
                P
              </div>
            </div>
            <h1 className="font-heading text-[22px] sm:text-2xl font-bold text-slate-900 tracking-tight">
              Chào mừng trở lại
            </h1>
            <p className="text-[13.5px] text-slate-500 mt-1.5 leading-relaxed">
              Đăng nhập để tiếp tục quản lý lịch trình của bạn.
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50/90 border border-red-200/80 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <p className="font-semibold">Đăng nhập không thành công</p>
                <p className="text-red-600/90 text-[11.5px] mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-[13.5px] rounded-xl border ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                  } transition-all outline-none`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-[11.5px] font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Mật khẩu
                </label>
                <a href="#" className="text-[12px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 text-[13.5px] rounded-xl border ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                  } transition-all outline-none`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-[11.5px] font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="pt-0.5 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 transition-all cursor-pointer"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-slate-600 font-normal">Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-[13.5px] rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>

          {/* Link to Register */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline ml-1">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Tagline & Copyright */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-500 tracking-wide">Quản lý thời gian. Làm chủ mỗi ngày.</p>
          <p>© 2026 Planora. Thiết kế giao diện quản lý lịch trình và công việc.</p>
        </div>
      </div>
    </AuthLayout>
  );
};
