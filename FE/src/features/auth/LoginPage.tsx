import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { loginSchema } from './validations/authSchemas';
import type { LoginFormData } from './types';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/lib/axios';
import type { User } from '@/types';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { Logo } from '@/components/ui/Logo';

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
    <div className="w-full min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#0A0E17] text-slate-100 font-sans antialiased">
      <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-6 lg:px-8 lg:py-5 z-10 bg-[#0A0E17] overflow-y-auto custom-dark-scrollbar min-h-0 relative">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-0"></div>

        <div className="flex items-center justify-between relative z-10 shrink-0 mb-2">
          <Logo size="sm" theme="dark" />
        </div>

        <div className="my-auto py-3 max-w-md w-full mx-auto relative z-10">
          <div className="mb-3 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              CHÀO MỪNG TRỞ LẠI
            </h1>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Đăng nhập để tiếp tục quản lý lịch trình của bạn.
            </p>
          </div>

          <div className="mb-2">
            <GoogleAuthButton
              buttonText="Đăng nhập bằng Google"
              theme="dark"
              onError={(msg) => setAuthError(msg)}
            />
            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative bg-[#0A0E17] px-3 text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                Hoặc bằng email
              </div>
            </div>
          </div>

          {authError && (
            <div className="mb-2 p-2 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <p className="font-semibold text-rose-300">Đăng nhập không thành công</p>
                <p className="text-rose-400 text-[11px] mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1">
                Email <span className="text-indigo-400 font-bold">*</span>
              </label>
              <div className="relative rounded-xl group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  className={`block w-full rounded-xl border pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none transition duration-150 ${
                    errors.email
                      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-rose-950/20'
                      : 'border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-0.5 text-[10.5px] text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-400" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-medium text-slate-300">
                  Mật khẩu <span className="text-indigo-400 font-bold">*</span>
                </label>
                <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative rounded-xl group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  className={`block w-full rounded-xl border pl-9 pr-8 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none transition duration-150 ${
                    errors.password
                      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-rose-950/20'
                      : 'border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-0.5 text-[10.5px] text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-400" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer accent-indigo-500"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-slate-400 font-normal">Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 active:from-indigo-600 active:to-blue-700 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer group"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    Đăng nhập
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-3 text-center text-xs text-slate-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline ml-1">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        <div className="text-center text-[10.5px] text-slate-500 shrink-0 pt-1">
          © 2026 Planora. Hệ thống quản lý lịch trình & công việc thông minh.
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-6 relative h-full bg-slate-900 overflow-hidden">
        <img
          src="/planora_auth_bg.jpg"
          alt="Planora Architectural Workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17] via-[#0A0E17]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17]/90 via-transparent to-[#0A0E17]/20"></div>

        <div className="absolute bottom-10 left-10 right-10 z-10 text-white select-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-indigo-200 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Workspace Quản Lý Lịch Trình</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight text-white drop-shadow-sm">
            Quản lý thời gian.<br />Làm chủ mỗi ngày.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md leading-relaxed font-light">
            Thiết lập mục tiêu, sắp xếp công việc tự động và tối ưu hóa hiệu suất làm việc chuyên nghiệp cùng Planora.
          </p>
        </div>
      </div>
    </div>
  );
};
