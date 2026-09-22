import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { TimeWheel } from './TimeWheel';

export interface TimePickerProps {
  value: string; // "HH:mm" (24-hour format)
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  align?: 'left' | 'right';
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Chọn giờ...',
  disabled = false,
  required = false,
  className = '',
  error,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parseTime = (val: string) => {
    if (!val || !val.includes(':')) {
      return { hour12: '12', minute: '00', meridiem: 'AM' };
    }
    const [hStr, mStr] = val.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) {
      return { hour12: '12', minute: '00', meridiem: 'AM' };
    }
    const meridiem = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return {
      hour12: String(h12).padStart(2, '0'),
      minute: String(m).padStart(2, '0'),
      meridiem,
    };
  };

  const { hour12, minute, meridiem } = parseTime(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateTime = (h12: string, min: string, mer: string) => {
    let h24 = parseInt(h12, 10);
    if (mer === 'PM' && h24 < 12) h24 += 12;
    if (mer === 'AM' && h24 === 12) h24 = 0;
    const h24Str = String(h24).padStart(2, '0');
    const val24 = `${h24Str}:${min}`;
    onChange(val24);
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

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
          <Clock className="h-4 w-4 shrink-0 text-[#64748B]" />
          {value ? (
            `${hour12}:${minute} ${meridiem}`
          ) : (
            <span className="text-[#94A3B8] font-normal">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={clsx('h-4 w-4 shrink-0 text-[#64748B] transition-transform', isOpen && 'rotate-180')} />
      </button>

      {error && <span className="text-xs font-medium text-[#F43F5E]">{error}</span>}

      {isOpen && (
        <div className={clsx("absolute top-[calc(100%+6px)] z-50 w-[280px] overflow-hidden rounded-2xl", align === "right" ? "right-0" : "left-0") + " border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-150"}>
          {/* Header Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-2.5 py-2">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Clock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>Giờ</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* AM / PM Toggle */}
              <div className="flex shrink-0 rounded-lg border border-slate-200/80 bg-white p-0.5 shadow-xs">
                {['AM', 'PM'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => updateTime(hour12, minute, period)}
                    className={clsx(
                      'h-6 rounded-md px-2 text-[11px] font-black transition-all cursor-pointer',
                      meridiem === period
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-6 shrink-0 rounded-lg bg-indigo-50 px-2 text-[11px] font-extrabold text-indigo-600 transition-colors hover:bg-indigo-100 cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>

          {/* Hour & Minute Scroll Columns */}
          <div className="p-3">
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 p-3">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-1 px-1 pb-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                <div>Giờ</div>
                <div className="w-3" />
                <div>Phút</div>
              </div>
              <div className="pointer-events-none absolute left-3 right-3 top-[76px] h-9 rounded-xl bg-white ring-1 ring-indigo-300 shadow-sm" />
              <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
                <TimeWheel
                  label="Giờ"
                  options={hourOptions}
                  value={hour12}
                  onChange={(h) => updateTime(h, minute, meridiem)}
                />
                <div className="flex h-[108px] w-3 items-center justify-center text-lg font-black text-slate-300">:</div>
                <TimeWheel
                  label="Phút"
                  options={minuteOptions}
                  value={minute}
                  onChange={(m) => updateTime(hour12, m, meridiem)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

