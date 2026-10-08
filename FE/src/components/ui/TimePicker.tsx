import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 256, maxHeight: 288 });

  useLayoutEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      const trigger = triggerRef.current;
      const popup = popupRef.current;
      if (!trigger || !popup) return;
      const rect = trigger.getBoundingClientRect();
      const panel = trigger.closest('[data-modal-panel]')?.getBoundingClientRect();
      const leftEdge = Math.max(8, panel ? panel.left + 16 : 8);
      const rightEdge = Math.min(window.innerWidth - 8, panel ? panel.right - 16 : window.innerWidth - 8);
      const topEdge = Math.max(8, panel ? panel.top + 64 : 8);
      // Reserve the modal footer so the picker does not cover Save/Cancel.
      const bottomEdge = Math.min(window.innerHeight - 8, panel ? panel.bottom - 76 : window.innerHeight - 8);
      // Keep the popup compact and visually aligned with the time input.
      const width = Math.min(256, rect.width, rightEdge - leftEdge);
      const below = Math.max(0, bottomEdge - rect.bottom - 6);
      const above = Math.max(0, rect.top - topEdge - 6);
      const naturalHeight = popup.scrollHeight;
      const openBelow = below >= naturalHeight || below >= above;
      const maxHeight = Math.max(80, openBelow ? below : above);
      const height = Math.min(naturalHeight, maxHeight);
      const left = Math.max(leftEdge, Math.min(align === 'right' ? rect.right - width : rect.left, rightEdge - width));
      const top = Math.max(topEdge, openBelow ? rect.bottom + 6 : rect.top - height - 6);
      setPosition({ top, left, width, maxHeight });
    };
    reposition();
    const onScroll = (event: Event) => {
      if (!popupRef.current?.contains(event.target as Node)) reposition();
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, align]);

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
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && !popupRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener('keydown', escape, true);
    return () => window.removeEventListener('keydown', escape, true);
  }, [isOpen]);

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
        ref={triggerRef}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
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

      {isOpen && createPortal(
        <div ref={popupRef} role="dialog" aria-label={label || 'Chọn giờ'} style={position} className="fixed z-[100] max-h-[calc(100dvh-16px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.16)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text-main)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
          {/* Header Toolbar */}
          <div className="flex items-center justify-between gap-1.5 border-b border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface-container)]">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-[var(--color-text-sub)]">
              <Clock className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
              <span>Giờ</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* AM / PM Toggle */}
              <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
                {['AM', 'PM'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => updateTime(hour12, minute, period)}
                    className={clsx(
                      'h-6 rounded-md px-2 text-[11px] font-black transition-all cursor-pointer',
                      meridiem === period
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-indigo-50 dark:text-[var(--color-text-main)] dark:hover:bg-indigo-500/15'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-6 shrink-0 rounded-lg bg-indigo-600 px-2 text-[11px] font-extrabold text-white transition-colors hover:bg-indigo-700 cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>

          {/* Hour & Minute Scroll Columns */}
          <div className="p-2.5">
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface-container)]">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-1 px-1 pb-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <div>Giờ</div>
                <div className="w-3" />
                <div>Phút</div>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-8 -translate-y-1/2 rounded-lg bg-white ring-1 ring-indigo-300 shadow-sm dark:bg-indigo-500/15 dark:ring-indigo-400/50" />
                <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-1">
                  <TimeWheel
                    label="Giờ"
                    options={hourOptions}
                    value={hour12}
                    onChange={(h) => updateTime(h, minute, meridiem)}
                  />
                  <div className="flex h-24 w-3 items-center justify-center text-base font-black text-slate-400 dark:text-slate-300">:</div>
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
        </div>
      , document.body)}
    </div>
  );
};

