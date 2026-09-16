import React from 'react';
import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import type { CategoryType } from '@/types';
import { CATEGORY_MAP } from '@/utils/categories';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category?: CategoryType;
  variant?: 'pill' | 'rounded';
  size?: 'sm' | 'md';
  customColor?: string;
  customBg?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  category,
  variant = 'pill',
  size = 'md',
  customColor,
  customBg,
  className,
  ...props
}) => {
  const catInfo = category ? CATEGORY_MAP[category] : null;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-medium leading-none gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold leading-none gap-1.5',
  };

  const shapeStyles = {
    pill: 'rounded-full',
    rounded: 'rounded-md',
  };

  const styleObj: React.CSSProperties = catInfo
    ? {
        color: catInfo.color,
        backgroundColor: catInfo.bgColor,
        border: `1px solid ${catInfo.borderColor}`,
      }
    : customColor && customBg
    ? {
        color: customColor,
        backgroundColor: customBg,
      }
    : {};

  return (
    <span
      style={{ ...styleObj, '--badge-color': catInfo?.color || customColor || '#94A3B8' } as React.CSSProperties}
      className={twMerge(
        'inline-flex items-center justify-center select-none font-sans',
        (catInfo || customColor) && 'theme-badge',
        !catInfo && !customColor && 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
        shapeStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {catInfo && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: catInfo.color }}
        />
      )}
      {children || catInfo?.label}
    </span>
  );
};
