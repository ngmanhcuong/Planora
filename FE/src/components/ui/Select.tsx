import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Tag } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Chọn danh mục...',
  disabled = false,
  required = false,
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || (value === '' ? options[0] : undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={clsx('relative flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-[#131B2E]">
          {label} {required && <span className="text-[#F43F5E]">*</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left text-sm font-semibold transition-all shadow-sm cursor-pointer',
          disabled && 'cursor-not-allowed opacity-60 bg-slate-50',
          error
            ? 'border-[#F43F5E] focus:ring-[#F43F5E]/10'
            : 'border-[#E2E8F0] hover:border-[#C7D2FE] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10',
          isOpen && 'border-[#4F46E5] ring-4 ring-[#4F46E5]/10'
        )}
      >
        <span className="flex items-center gap-2.5 truncate text-[#131B2E]">
          {selectedOption?.color ? (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: selectedOption.color }} />
          ) : selectedOption?.icon ? (
            selectedOption.icon
          ) : (
            <Tag className="h-4 w-4 shrink-0 text-[#64748B]" />
          )}
          <span>{selectedOption ? selectedOption.label : <span className="text-[#94A3B8] font-normal">{placeholder}</span>}</span>
        </span>
        <ChevronDown className={clsx('h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {error && <span className="text-xs font-medium text-[#F43F5E]">{error}</span>}

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] animate-in fade-in zoom-in-95 duration-150">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  'flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#131B2E]'
                )}
              >
                {option.color ? (
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />
                ) : option.icon ? (
                  option.icon
                ) : null}
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
