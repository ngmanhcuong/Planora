import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';

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
  const language = useCurrentLanguage();
  const locale = ({ vi: 'vi-VN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', ru: 'ru-RU', th: 'th-TH', it: 'it-IT', hi: 'hi-IN' } as const)[language];
  const [isOpen, setIsOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const validInitial = !isNaN(initialDate.getTime()) ? initialDate : new Date();
  const [viewMonth, setViewMonth] = useState<Date>(new Date(validInitial.getFullYear(), validInitial.getMonth(), 1));
  const [yearPageStart, setYearPageStart] = useState(Math.floor(validInitial.getFullYear() / 12) * 12);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsYearPickerOpen(false);
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
      return new Date(`${val}T00:00:00`).toLocaleDateString(locale);
    }
    return val;
  };

  const todayStr = formatDateStr(new Date());
  const yearOptions = Array.from({ length: 12 }, (_, index) => yearPageStart + index);
  const weekdayLabels = Array.from({ length: 7 }, (_, index) => (
    new Date(2026, 0, 4 + index).toLocaleDateString(locale, { weekday: 'short' })
  ));

  const handleSelect = (d: Date) => {
    const dateStr = formatDateStr(d);
    onChange(dateStr);
    setIsOpen(false);
    setIsYearPickerOpen(false);
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
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (next) {
              const current = value ? new Date(`${value}T00:00:00`) : new Date();
              if (!Number.isNaN(current.getTime())) {
                setViewMonth(new Date(current.getFullYear(), current.getMonth(), 1));
                setYearPageStart(Math.floor(current.getFullYear() / 12) * 12);
              }
            } else {
              setIsYearPickerOpen(false);
            }
            return next;
          });
        }}
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
              onClick={() => isYearPickerOpen ? setYearPageStart((start) => start - 12) : changeMonth(-1)}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#131B2E] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setYearPageStart(Math.floor(year / 12) * 12);
                setIsYearPickerOpen((current) => !current);
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#131B2E] transition-colors hover:bg-[#F1F5F9] cursor-pointer"
              aria-label="Chọn năm"
              aria-expanded={isYearPickerOpen}
            >
              {isYearPickerOpen
                ? `${yearPageStart} – ${yearPageStart + 11}`
                : viewMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
              <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', isYearPickerOpen && 'rotate-180')} />
            </button>
            <button
              type="button"
              onClick={() => isYearPickerOpen ? setYearPageStart((start) => start + 12) : changeMonth(1)}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#131B2E] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {isYearPickerOpen ? (
            <div className="grid grid-cols-3 gap-1.5 py-1">
              {yearOptions.map((yearOption) => (
                <button
                  type="button"
                  key={yearOption}
                  onClick={() => {
                    setViewMonth(new Date(yearOption, month, 1));
                    setIsYearPickerOpen(false);
                  }}
                  className={clsx(
                    'flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer',
                    yearOption === year
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5]'
                  )}
                >
                  {yearOption}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-[#94A3B8]">
                {weekdayLabels.map((day) => (
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
            </>
          )}
        </div>
      )}
    </div>
  );
};


