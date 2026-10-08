import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { ApiCategory } from '@/types';

interface CategoryChipPickerProps {
  categories?: ApiCategory[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CATEGORY_ORDER = ['STUDY', 'WORK', 'MEETING', 'PERSONAL', 'HABIT', 'DEADLINE'];

export const CategoryChipPicker: React.FC<CategoryChipPickerProps> = ({
  categories = [],
  value,
  onChange,
  disabled,
}) => {
  const options = useMemo(() => [
    { id: '', name: 'Không phân loại', type: 'UNCATEGORIZED', color: '#94A3B8' },
    ...[...categories].sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a.type?.toUpperCase());
      const bIndex = CATEGORY_ORDER.indexOf(b.type?.toUpperCase());
      return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
    }),
  ], [categories]);

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-1 text-xs font-semibold text-[var(--color-text)]">Danh mục</legend>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] p-2.5">
        {options.map((option) => {
          const isActive = value === option.id;
          return (
            <button
              key={option.id || 'uncategorized'}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={isActive}
              className={clsx(
                'inline-flex min-h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60',
                isActive
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-sub)] hover:border-indigo-300 hover:text-indigo-600'
              )}
            >
              {isActive ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: option.color || '#6366F1' }} />
              )}
              <span>{option.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
