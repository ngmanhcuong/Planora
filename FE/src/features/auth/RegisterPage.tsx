import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Mail, Phone, Briefcase, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { registerSchema } from './validations/authSchemas';
import type { RegisterFormData } from './types';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/lib/axios';
import type { User } from '@/types';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { Logo } from '@/components/ui/Logo';

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
    <div className="w-full min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#0A0E17] text-slate-100 font-sans antialiased">
      {/* Left Panel: Registration Form Section (6 columns on lg screens) */}
      <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-6 lg:px-8 lg:py-5 z-10 bg-[#0A0E17] overflow-y-auto custom-dark-scrollbar min-h-0 relative">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-0"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10 shrink-0 mb-2">
          <Logo size="sm" theme="dark" />
        </div>

        {/* Form Container (No card border, sitting directly on background) */}
        <div className="my-auto py-3 max-w-md w-full mx-auto relative z-10">
          {/* Header Title */}
          <div className="mb-3 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              TẠO TÀI KHOẢN MỚI
            </h1>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Nhập thông tin cá nhân bên dưới để khởi tạo tài khoản Planora của bạn.
            </p>
          </div>

          {/* Google Auth Button */}
          <div className="mb-2">
            <GoogleAuthButton
              buttonText="Đăng ký bằng Google"
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

          {/* Error Banner */}
          {authError && (
            <div className="mb-2 p-2 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <p className="font-semibold text-rose-300">Đăng ký không thành công</p>
                <p className="text-rose-400 text-[11px] mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            {/* Họ và tên và email mỗi trường một hàng */}
            <div className="grid grid-cols-1 gap-3">
              {/* Field 1: Họ và tên */}
              <div>
                <label htmlFor="fullname" className="block text-xs font-medium text-slate-300 mb-1">
                  Họ và tên <span className="text-indigo-400 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Nhập họ và tên"
                    className={`block w-full rounded-xl border pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none transition duration-150 ${
                      errors.fullname
                        ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-rose-950/20'
                        : 'border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
                    }`}
                    {...register('fullname')}
                  />
                </div>
                {errors.fullname && (
                  <p className="mt-0.5 text-[10.5px] text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-400" />
                    <span>{errors.fullname.message}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1">
                  Địa chỉ Email <span className="text-indigo-400 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
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
            </div>

            {/* Row 2: Số điện thoại (Left) & Mục đích sử dụng (Right) */}
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
              {/* Field 3: Số điện thoại */}
              <div className="min-w-0">
                <label htmlFor="phone" className="block text-xs font-medium text-slate-300 mb-1">
                  Số điện thoại <span className="text-indigo-400 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="0912345678"
                    className={`block w-full rounded-xl border pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none transition duration-150 ${
                      errors.phone
                        ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-rose-950/20'
                        : 'border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
                    }`}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-0.5 text-[10.5px] text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-400" />
                    <span>{errors.phone.message}</span>
                  </p>
                )}
              </div>

              {/* Field 4: Mục đích sử dụng */}
              <div className="min-w-0">
                <label htmlFor="purpose" className="block text-xs font-medium text-slate-300 mb-1">
                  Mục đích sử dụng <span className="text-indigo-400 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    id="purpose"
                    className={`block w-full rounded-xl border pl-9 pr-3 py-2 text-sm text-white focus:outline-none transition duration-150 appearance-none cursor-pointer ${
                      errors.purpose
                        ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-rose-950/20'
                        : 'border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
                    }`}
                    {...register('purpose')}
                  >
                    <option value="" className="bg-slate-900 text-slate-400">-- Chọn mục đích --</option>
                    <option value="STUDY" className="bg-slate-900 text-white">Học tập & Sinh viên</option>
                    <option value="WORK" className="bg-slate-900 text-white">Làm việc văn phòng</option>
                    <option value="FREELANCE" className="bg-slate-900 text-white">Làm việc tự do (Freelancer)</option>
                    <option value="TEAM" className="bg-slate-900 text-white">Quản lý đội ngũ / Doanh nghiệp</option>
                    <option value="PERSONAL" className="bg-slate-900 text-white">Quản lý cá nhân</option>
                  </select>
                </div>
                {errors.purpose && (
                  <p className="mt-0.5 text-[10.5px] text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-400" />
                    <span>{errors.purpose.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Field 5: Mật khẩu */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1">
                  Mật khẩu <span className="text-indigo-400 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu (8+ ký tự)"
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

              {/* Field 6: Xác nhận mật khẩu */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-300 mb-1">
                  Xác nhận mật khẩu <span className="text-indigo-400 font-bold">*</span>
                </label>
                <div className="relative rounded-xl group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    className={`block w-full rounded-xl border pl-9 pr-8 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none transition duration-150 ${
                      errors.confirmPassword
                        ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-rose-950/20'
                        : 'border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
                    }`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                    title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-0.5 text-[10.5px] text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 text-rose-400" />
                    <span>{errors.confirmPassword.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox: Terms & Policies */}
            <div className="pt-0.5">
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer accent-indigo-500"
                  {...register('terms')}
                />
                <label htmlFor="terms" className="ml-2 text-xs text-slate-400 cursor-pointer select-none">
                  Tôi đồng ý với{' '}
                  <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                    Chính sách bảo mật
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-0.5 text-[10.5px] text-rose-400 font-medium">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
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
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    Tạo tài khoản
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Prompt */}
          <div className="mt-3 text-center text-xs text-slate-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline ml-1">
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        {/* Subtitle & Copyright */}
        <div className="text-center text-[10.5px] text-slate-500 shrink-0 pt-1">
          © 2026 Planora. Hệ thống quản lý lịch trình & công việc thông minh.
        </div>
      </div>

      {/* Right Panel: Architectural Background Image Showcase (6 columns on lg screens) */}
      <div className="hidden lg:block lg:col-span-6 relative h-full bg-slate-900 overflow-hidden">
        <img
          src="/planora_auth_bg.jpg"
          alt="Planora Architectural Workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle Gradients for Seamless Blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17] via-[#0A0E17]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17]/90 via-transparent to-[#0A0E17]/20"></div>

        {/* Overlay Content Card */}
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



