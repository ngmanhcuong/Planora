import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Mail, Phone, Briefcase, Lock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { AuthLayout } from './components/AuthLayout';
import { registerSchema } from './validations/authSchemas';
import type { RegisterFormData } from './types';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/lib/axios';
import type { User } from '@/types';

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      purpose: '',
      password: '',
      confirmPassword: '',
      terms: true,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const response = await apiClient.post('/auth/register', {
        name: data.fullname,
        email: data.email,
        phone: data.phone,
        purpose: data.purpose,
        password: data.password,
        confirmPassword: data.confirmPassword,
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
        setAuthError(response.data.message || 'Đăng ký không thành công.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Email hoặc thông tin nhập vào không hợp lệ.';
      setAuthError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      topRightLink={{
        text: 'Đã có tài khoản?',
        linkText: 'Đăng nhập',
        href: '/login',
      }}
    >
      <div className="w-full max-w-[620px] my-auto">
        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05),0_4px_15px_-5px_rgba(79,70,229,0.06)] p-5 sm:p-7 relative overflow-hidden">
          {/* Top Gradient Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-500"></div>

          {/* Header */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
                  Tạo tài khoản Planora
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bắt đầu làm chủ thời gian và quản lý công việc hiệu quả mỗi ngày.
              </p>
            </div>
            <div className="shrink-0 self-start sm:self-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-[11px]">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Miễn phí 14 ngày
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <p className="font-semibold">Đăng ký không thành công</p>
                <p className="text-rose-600 text-[11px] mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            {/* Grid 2-column input fields for 6 required items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {/* Field 1: Họ và tên */}
              <div>
                <label htmlFor="fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên <span className="text-indigo-600 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Nhập họ và tên"
                    className={`block w-full rounded-xl border pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition duration-150 ${
                      errors.fullname
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                    }`}
                    {...register('fullname')}
                  />
                </div>
                {errors.fullname && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-500" />
                    <span>{errors.fullname.message}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email <span className="text-indigo-600 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className={`block w-full rounded-xl border pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition duration-150 ${
                      errors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-500" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Field 3: Số điện thoại */}
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại <span className="text-indigo-600 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="0912345678"
                    className={`block w-full rounded-xl border pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition duration-150 ${
                      errors.phone
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                    }`}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-500" />
                    <span>{errors.phone.message}</span>
                  </p>
                )}
              </div>

              {/* Field 4: Mục đích sử dụng */}
              <div>
                <label htmlFor="purpose" className="block text-xs font-semibold text-slate-700 mb-1">
                  Mục đích sử dụng <span className="text-indigo-600 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    id="purpose"
                    className={`block w-full rounded-xl border pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none transition duration-150 appearance-none bg-no-repeat bg-right cursor-pointer ${
                      errors.purpose
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                    }`}
                    {...register('purpose')}
                  >
                    <option value="">-- Chọn mục đích sử dụng --</option>
                    <option value="STUDY">Học tập & Sinh viên</option>
                    <option value="WORK">Làm việc văn phòng</option>
                    <option value="FREELANCE">Làm việc tự do (Freelancer)</option>
                    <option value="TEAM">Quản lý đội ngũ / Doanh nghiệp</option>
                    <option value="PERSONAL">Quản lý thời gian cá nhân</option>
                  </select>
                </div>
                {errors.purpose && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-500" />
                    <span>{errors.purpose.message}</span>
                  </p>
                )}
              </div>

              {/* Field 5: Mật khẩu */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu <span className="text-indigo-600 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tạo mật khẩu (8+ ký tự)"
                    className={`block w-full rounded-xl border pl-9 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition duration-150 ${
                      errors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-500" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Field 6: Xác nhận mật khẩu */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu <span className="text-indigo-600 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    className={`block w-full rounded-xl border pl-9 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition duration-150 ${
                      errors.confirmPassword
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                    }`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-500" />
                    <span>{errors.confirmPassword.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox: Terms & Policies */}
            <div className="pt-0.5">
              <div className="flex items-start">
                <div className="flex h-4 items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0 cursor-pointer"
                    {...register('terms')}
                  />
                </div>
                <div className="ml-2 text-[11.5px] text-slate-600 leading-tight">
                  <label htmlFor="terms" className="cursor-pointer select-none">
                    Tôi đồng ý với{' '}
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                      Điều khoản dịch vụ
                    </a>{' '}
                    và{' '}
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                      Chính sách bảo mật
                    </a>
                  </label>
                </div>
              </div>
              {errors.terms && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:from-indigo-800 active:to-indigo-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <span>Tạo tài khoản</span>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Prompt */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline ml-1">
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        {/* Subtitle & Copyright */}
        <div className="mt-3 text-center text-xs text-slate-400 space-y-0.5">
          <p className="font-medium text-slate-500">Quản lý thời gian. Làm chủ mỗi ngày.</p>
          <p className="text-[11px]">© 2026 Planora. Hệ thống quản lý lịch trình & công việc.</p>
        </div>
      </div>
    </AuthLayout>
  );
};



