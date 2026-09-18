import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
  variant?: 'plain' | 'boxed';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'dark',
  variant = 'plain',
  className = '',
}) => {
  const plainSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11',
  };

  const boxedSizes = {
    sm: 'w-7 h-7 rounded-lg p-1 bg-white shadow-sm shadow-sky-500/15 ring-1 ring-slate-200/80',
    md: 'w-8.5 h-8.5 rounded-xl p-1 bg-white shadow-sm shadow-sky-500/15 ring-1 ring-slate-200/80',
    lg: 'w-10 h-10 rounded-2xl p-1.5 bg-white shadow-sm shadow-sky-500/15 ring-1 ring-slate-200/80',
    xl: 'w-13 h-13 rounded-2xl p-2 bg-white shadow-sm shadow-sky-500/15 ring-1 ring-slate-200/80',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const isDark = theme === 'dark';
  const isBoxed = variant === 'boxed';

  return (
    <div className={`inline-flex items-center gap-2 ${className} select-none`}>
      <div
        className={`flex items-center justify-center shrink-0 ${
          isBoxed ? boxedSizes[size] : plainSizes[size]
        }`}
      >
        <img
          src="/planora-logo-icon.png"
          alt="Planora"
          className="w-full h-full object-contain drop-shadow-sm"
          draggable={false}
        />
      </div>

      {showText && (
        <span
          className={`font-heading font-bold tracking-tight ${textSizes[size]} ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Planora
        </span>
      )}
    </div>
  );
};
