import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'dark',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-sm rounded-xl',
    md: 'w-9 h-9 text-lg rounded-xl',
    lg: 'w-11 h-11 text-xl rounded-2xl',
    xl: 'w-14 h-14 text-2xl rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className} select-none`}>
      {/* Original Planora "P" Icon Badge */}
      <div
        className={`bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-heading font-extrabold shadow-sm shadow-indigo-500/30 shrink-0 ${iconSizes[size]}`}
      >
        P
      </div>

      {/* Brand Text */}
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
