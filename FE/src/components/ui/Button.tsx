import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { getMultiLangText, normalizeLanguage } from '@/lib/i18n';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);


  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg';

  const variantStyles = {
    primary: 'bg-[#4F46E5] text-white hover:bg-[#4338CA] active:scale-[0.98] focus:ring-[#C7D2FE]',
    secondary: 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] focus:ring-[#E2E8F0]',
    outline: 'bg-transparent text-[#4F46E5] border border-[#4F46E5] hover:bg-[#EEF2FF] focus:ring-[#C7D2FE]',
    ghost: 'bg-transparent text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus:ring-transparent',
    destructive: 'bg-[#FFF1F2] text-[#F43F5E] border border-[#FFE4E6] hover:bg-[#F43F5E] hover:text-white focus:ring-[#FECDD3]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
  };

  return (
    <button
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {getMultiLangText(language, { vi: 'Đang xử lý...', en: 'Processing...', ja: '処理中...', ko: '처리 중...', zh: '处理中...', fr: 'Traitement...', de: 'Wird verarbeitet...', es: 'Procesando...' })}
        </>
      ) : (
        children
      )}
    </button>
  );
};
