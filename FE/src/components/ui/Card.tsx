import React from 'react';
import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  bordered = true,
  padding = 'md',
  className,
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={twMerge(
        'bg-white rounded-xl transition-all duration-200 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]',
        bordered && 'border border-[#E2E8F0]',
        hoverable && 'hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 cursor-pointer',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
