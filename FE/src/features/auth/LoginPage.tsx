import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight, CheckCircle2, KeyRound, ShieldCheck, RefreshCw, ArrowLeft, Check } from 'lucide-react';
import clsx from 'clsx';
import { loginSchema } from './validations/authSchemas';
import type { LoginFormData } from './types';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/lib/axios';
import type { User } from '@/types';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { Logo } from '@/components/ui/Logo';

interface LoginPageProps {
  initialMode?: 'login' | 'forgot';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'login' }) => {
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>(initialMode);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetForm, setResetForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const currentEmail = watch('email');

  // Countdown timer for OTP
  useEffect(() => {
    let timerId: any;
    if (viewMode === 'forgot' && forgotStep === 2 && otpTimer > 0) {
      timerId = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [viewMode, forgotStep, otpTimer]);

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
        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
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

  const openResetPassword = () => {
    setResetError(null);
    setResetSuccess(null);
    setForgotStep(1);
    setOtpCode('');
    setResetForm((prev) => ({
      ...prev,
      email: currentEmail || prev.email,
      newPassword: '',
      confirmPassword: '',
    }));
    setViewMode('forgot');
  };

  // Step 1: Send OTP to Email
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    const email = resetForm.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setResetError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setIsSendingOtp(true);

    try {
      await apiClient.post('/auth/forgot-password/otp', { email });
      setForgotStep(2);
      setOtpTimer(60);
      setOtpCode('');
      setResetForm((prev) => ({ ...prev, email }));
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng kiểm tra cấu hình email và thử lại.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setResetError(null);
    setResetSuccess(null);
    setIsSendingOtp(true);

    try {
      await apiClient.post('/auth/forgot-password/otp', {
        email: resetForm.email.trim().toLowerCase(),
      });
      setOtpCode('');
      setOtpTimer(60);
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Không thể gửi lại OTP. Vui lòng thử lại.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    const code = otpCode.trim();
    if (!code) {
      setResetError('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }
    if (code.length !== 6) {
      setResetError('Mã OTP phải bao gồm đúng 6 chữ số.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await apiClient.post('/auth/forgot-password/verify', {
        email: resetForm.email.trim().toLowerCase(),
        otp: code,
      });
      setForgotStep(3);
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Create New Password & Submit
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    const email = resetForm.email.trim().toLowerCase();

    if (resetForm.newPassword.length < 8) {
      setResetError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsResetting(true);

    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email,
        newPassword: resetForm.newPassword,
        confirmPassword: resetForm.confirmPassword,
      });

      setValue('email', email);
      setValue('password', '');
      setResetSuccess(response.data?.message || 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.');
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsResetting(false);
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
          {viewMode === 'login' ? (
            <>
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
                    <button
                      type="button"
                      onClick={openResetPassword}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
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
            </>
          ) : (
            <>
              {/* Header Title */}
              <div className="mb-4 text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                  ĐẶT LẠI MẬT KHẨU
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  {forgotStep === 1 && 'Nhập email tài khoản của bạn để nhận mã xác thực OTP.'}
                  {forgotStep === 2 && 'Nhập mã OTP 6 chữ số đã được gửi đến email của bạn.'}
                  {forgotStep === 3 && 'Nhập mật khẩu mới và xác nhận mật khẩu để hoàn tất.'}
                </p>
              </div>

              {/* Ultra-Modern Stepper Header */}
              <div className="mb-6 space-y-2.5">
                {/* Segmented Progress Bars */}
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={clsx(
                      'h-1.5 rounded-full transition-all duration-500',
                      forgotStep >= 1
                        ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                        : 'bg-slate-800/80'
                    )}
                  />
                  <div
                    className={clsx(
                      'h-1.5 rounded-full transition-all duration-500',
                      forgotStep >= 2
                        ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                        : 'bg-slate-800/80'
                    )}
                  />
                  <div
                    className={clsx(
                      'h-1.5 rounded-full transition-all duration-500',
                      forgotStep === 3
                        ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                        : 'bg-slate-800/80'
                    )}
                  />
                </div>

                {/* Step Badges Row */}
                <div className="flex items-center justify-between text-xs px-0.5 pt-0.5">
                  {/* Step 1 Badge */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={clsx(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all',
                        forgotStep > 1
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : forgotStep === 1
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/50 ring-2 ring-indigo-400/40'
                          : 'bg-slate-800/80 text-slate-500'
                      )}
                    >
                      {forgotStep > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
                    </div>
                    <span
                      className={clsx(
                        'text-[11px] font-bold transition-colors',
                        forgotStep === 1 ? 'text-indigo-300 font-extrabold' : forgotStep > 1 ? 'text-emerald-400' : 'text-slate-500'
                      )}
                    >
                      Nhập Email
                    </span>
                  </div>

                  {/* Step 2 Badge */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={clsx(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all',
                        forgotStep > 2
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : forgotStep === 2
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/50 ring-2 ring-indigo-400/40'
                          : 'bg-slate-800/80 text-slate-500'
                      )}
                    >
                      {forgotStep > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
                    </div>
                    <span
                      className={clsx(
                        'text-[11px] font-bold transition-colors',
                        forgotStep === 2 ? 'text-indigo-300 font-extrabold' : forgotStep > 2 ? 'text-emerald-400' : 'text-slate-500'
                      )}
                    >
                      Xác nhận OTP
                    </span>
                  </div>

                  {/* Step 3 Badge */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={clsx(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all',
                        forgotStep === 3
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/50 ring-2 ring-indigo-400/40'
                          : 'bg-slate-800/80 text-slate-500'
                      )}
                    >
                      3
                    </div>
                    <span
                      className={clsx(
                        'text-[11px] font-bold transition-colors',
                        forgotStep === 3 ? 'text-indigo-300 font-extrabold' : 'text-slate-500'
                      )}
                    >
                      Mật khẩu mới
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {resetError && (
                <div className="mb-3 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <p className="font-semibold text-rose-300">Thông báo</p>
                    <p className="text-rose-400 text-[11px] mt-0.5">{resetError}</p>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {resetSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <p className="font-bold text-sm text-emerald-300">Đặt lại mật khẩu thành công!</p>
                      <p className="text-emerald-400 text-xs mt-1">{resetSuccess}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setResetSuccess(null);
                      setResetError(null);
                    }}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Đăng nhập ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {/* STEP 1: Enter Email */}
                  {forgotStep === 1 && (
                    <form onSubmit={handleStep1Submit} className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label htmlFor="reset-email" className="block text-xs font-medium text-slate-300 mb-1">
                          Email tài khoản <span className="text-indigo-400 font-bold">*</span>
                        </label>
                        <div className="relative rounded-xl group">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            id="reset-email"
                            type="email"
                            required
                            value={resetForm.email}
                            onChange={(event) => setResetForm((prev) => ({ ...prev, email: event.target.value }))}
                            placeholder="Nhập địa chỉ email của bạn"
                            className="block w-full rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition duration-150"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode('login');
                            setResetError(null);
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] text-slate-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center"
                        >
                          Quay lại đăng nhập
                        </button>
                        <button
                          type="submit"
                          disabled={isSendingOtp}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
                        >
                          {isSendingOtp ? (
                            <span>Đang gửi mã...</span>
                          ) : (
                            <>
                              <span>Gửi mã OTP</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 2: Enter OTP Code */}
                  {forgotStep === 2 && (
                    <form onSubmit={handleStep2Submit} className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
                        <div className="flex items-center gap-2 font-bold text-indigo-300 mb-1">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          <span>Mã OTP đang được gửi</span>
                        </div>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed">
                          Vui lòng kiểm tra hộp thư của <strong className="text-white">{resetForm.email}</strong>. Email có thể mất vài giây để xuất hiện.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="otp-input" className="block text-xs font-medium text-slate-300 mb-1">
                          Nhập mã OTP (6 chữ số) <span className="text-indigo-400 font-bold">*</span>
                        </label>
                        <div className="relative rounded-xl group">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <KeyRound className="w-4 h-4" />
                          </div>
                          <input
                            id="otp-input"
                            type="text"
                            maxLength={6}
                            required
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="Nhập 6 chữ số OTP"
                            className="block w-full rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 pl-9 pr-3 py-2.5 text-sm font-mono tracking-widest text-white placeholder:text-slate-500 focus:outline-none transition duration-150"
                          />
                        </div>
                      </div>

                      {/* Resend OTP bar */}
                      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                        <span>Chưa nhận được mã?</span>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={otpTimer > 0 || isSendingOtp}
                          className={clsx(
                            'font-semibold flex items-center gap-1 cursor-pointer transition-colors',
                            otpTimer > 0 || isSendingOtp ? 'text-slate-600 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300 hover:underline'
                          )}
                        >
                          <RefreshCw className={clsx('w-3 h-3', isSendingOtp && 'animate-spin')} />
                          {isSendingOtp ? 'Đang gửi...' : otpTimer > 0 ? `Gửi lại mã (${otpTimer}s)` : 'Gửi lại mã OTP'}
                        </button>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotStep(1);
                            setResetError(null);
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] text-slate-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Quay lại</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isVerifyingOtp}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          <span>{isVerifyingOtp ? 'Đang xác nhận...' : 'Xác nhận OTP'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: Enter New Password & Confirm */}
                  {forgotStep === 3 && (
                    <form onSubmit={handleStep3Submit} className="space-y-3.5 animate-in fade-in duration-200">
                      <div>
                        <label htmlFor="reset-new-password" className="block text-xs font-medium text-slate-300 mb-1">
                          Mật khẩu mới <span className="text-indigo-400 font-bold">*</span>
                        </label>
                        <div className="relative rounded-xl group">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            id="reset-new-password"
                            type={showResetNewPassword ? 'text' : 'password'}
                            value={resetForm.newPassword}
                            onChange={(event) => setResetForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                            placeholder="Tối thiểu 8 ký tự"
                            className="block w-full rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 pl-9 pr-8 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none transition duration-150"
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetNewPassword((value) => !value)}
                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                            title={showResetNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reset-confirm-password" className="block text-xs font-medium text-slate-300 mb-1">
                          Xác nhận mật khẩu <span className="text-indigo-400 font-bold">*</span>
                        </label>
                        <div className="relative rounded-xl group">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            id="reset-confirm-password"
                            type={showResetConfirmPassword ? 'text' : 'password'}
                            value={resetForm.confirmPassword}
                            onChange={(event) => setResetForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                            placeholder="Nhập lại mật khẩu mới"
                            className="block w-full rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] focus:bg-[#0A0E17] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 pl-9 pr-8 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none transition duration-150"
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetConfirmPassword((value) => !value)}
                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                            title={showResetConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotStep(2);
                            setResetError(null);
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A] text-slate-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Quay lại</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isResetting}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          {isResetting ? 'Đang lưu...' : 'Đổi mật khẩu'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              <div className="mt-4 text-center text-xs text-slate-400">
                Nhớ mật khẩu của bạn?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setResetError(null);
                    setResetSuccess(null);
                  }}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer ml-1"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </>
          )}
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
