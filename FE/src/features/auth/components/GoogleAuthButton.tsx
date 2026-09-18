import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/lib/axios';
import type { User } from '@/types';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonTheme = 'filled_black' | 'outline';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type: 'standard';
              theme: GoogleButtonTheme;
              size: 'large';
              text: 'signin_with' | 'signup_with';
              shape: 'rectangular';
              logo_alignment: 'center';
              width: number;
            }
          ) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  buttonText?: string;
  theme?: 'dark' | 'light';
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  buttonText = 'Đăng nhập bằng Google',
  theme = 'dark',
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const googleButtonText = buttonText.toLowerCase().includes('đăng ký') ? 'signup_with' : 'signin_with';
  const buttonClasses =
    theme === 'dark'
      ? 'bg-[#1E293B] hover:bg-[#243247] border border-slate-700/80 text-slate-100 shadow-xs hover:shadow-md'
      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs hover:shadow-md';

  const handleGoogleCredential = async (credential: string) => {
    setIsLoading(true);
    setSetupError(null);

    try {
      const response = await apiClient.post('/auth/google', { credential });

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
        setIsLoading(false);
        if (onSuccess) onSuccess();
        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        return;
      }

      const msg = response.data.message || 'Đăng nhập Google không thành công.';
      setSetupError(msg);
      if (onError) onError(msg);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng nhập bằng tài khoản Google thất bại.';
      setSetupError(msg);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) {
      setSetupError('Chưa cấu hình VITE_GOOGLE_CLIENT_ID cho đăng nhập Google.');
      return;
    }

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !buttonContainerRef.current) {
        return;
      }

      buttonContainerRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response.credential) {
            void handleGoogleCredential(response.credential);
            return;
          }

          const msg = 'Google không trả về mã xác thực. Vui lòng thử lại.';
          setSetupError(msg);
          if (onError) onError(msg);
        },
      });

      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: 'standard',
        theme: theme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        text: googleButtonText,
        shape: 'rectangular',
        logo_alignment: 'center',
        width: buttonContainerRef.current.offsetWidth || 400,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.getElementById('google-jssdk') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton);
      return () => existingScript.removeEventListener('load', renderGoogleButton);
    }

    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      const msg = 'Không tải được Google Identity Services. Vui lòng kiểm tra kết nối mạng.';
      setSetupError(msg);
      if (onError) onError(msg);
    };
    document.body.appendChild(script);
  }, [googleButtonText, googleClientId, onError, theme]);

  return (
    <div className="space-y-2">
      <div className={`relative h-12 rounded-xl transition-all duration-200 ${buttonClasses} ${isLoading ? 'opacity-60' : ''}`}>
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center gap-3 px-4">
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span className="text-sm font-semibold">{isLoading ? 'Đang kết nối Google...' : buttonText}</span>
        </div>

        <div
          ref={buttonContainerRef}
          className={`absolute inset-0 z-10 overflow-hidden rounded-xl opacity-[0.01] [&>div]:!h-full [&>div]:!w-full [&_iframe]:!h-full [&_iframe]:!w-full ${
            isLoading ? 'pointer-events-none' : ''
          }`}
          aria-label={buttonText}
        />
      </div>

      {setupError && (
        <p className="text-[11px] text-rose-400 font-medium leading-snug">
          {setupError}
        </p>
      )}
    </div>
  );
};
