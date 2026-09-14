import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#131B2E] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#94A3B8] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              'w-full h-10 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#131B2E] placeholder-[#94A3B8] transition-all duration-150 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed',
              leftIcon ? 'pl-9 pr-3' : 'px-3',
              rightIcon ? 'pr-9' : 'pr-3',
              error && 'border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]/10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#94A3B8] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs font-medium text-[#F43F5E]">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[#64748B]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
