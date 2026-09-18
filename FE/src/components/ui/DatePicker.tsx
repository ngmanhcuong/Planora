import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  align?: 'left' | 'right';
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Chọn ngày...',
  disabled = false,
  required = false,
  className = '',
  error,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const validInitial = !isNaN(initialDate.getTime()) ? initialDate : new Date();
  const [viewMonth, setViewMonth] = useState<Date>(new Date(validInitial.getFullYear(), validInitial.getMonth(), 1));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeMonth = (delta: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(year, month + 1, d),
      isCurrentMonth: false,
    });
  }

  const formatDateStr = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplay = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  const todayStr = formatDateStr(new Date());

  const handleSelect = (d: Date) => {
    const dateStr = formatDateStr(d);
    onChange(dateStr);
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
          <Calendar className="h-4 w-4 shrink-0 text-[#64748B]" />
          {value ? formatDisplay(value) : <span className="text-[#94A3B8] font-normal">{placeholder}</span>}
        </span>
        <ChevronDown className={clsx('h-4 w-4 shrink-0 text-[#64748B] transition-transform', isOpen && 'rotate-180')} />
      </button>

      {error && <span className="text-xs font-medium text-[#F43F5E]">{error}</span>}

      {isOpen && (
        <div className={clsx("absolute top-[calc(100%+6px)] z-50 w-full min-w-[200px] rounded-2xl border border-[#E2E8F0] bg-white p-2.5 shadow-[0_20px_45px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-150", align === "right" ? "right-0" : "left-0")}>
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#131B2E] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs font-bold text-[#131B2E]">
              {viewMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#131B2E] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-[#94A3B8]">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <span key={day} className="py-0.5">{day}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-0.5">
            {days.map(({ date: itemDate, isCurrentMonth }) => {
              const valStr = formatDateStr(itemDate);
              const isSelected = valStr === value;
              const isToday = valStr === todayStr;

              return (
                <button
                  type="button"
                  key={valStr}
                  onClick={() => handleSelect(itemDate)}
                  className={clsx(
                    'h-7.5 w-full rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center',
                    isSelected && 'bg-[#4F46E5] text-white shadow-xs',
                    !isSelected && isToday && 'bg-[#EEF2FF] text-[#4F46E5]',
                    !isSelected && !isToday && isCurrentMonth && 'text-[#131B2E] hover:bg-[#F1F5F9]',
                    !isSelected && !isCurrentMonth && 'text-[#CBD5E1] hover:bg-[#F8FAFC]'
                  )}
                >
                  {itemDate.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


