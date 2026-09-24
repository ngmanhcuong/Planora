import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Video, AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { CalendarEventItem } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';
import type { WeekDayItem } from '@/utils/dateUtils';

export interface WeekGridProps {
  weekDays: WeekDayItem[];
  fullWeekDays?: WeekDayItem[];
  selectedDate?: Date;
  events: CalendarEventItem[];
  onSelectEvent?: (event: CalendarEventItem) => void;
  onSelectDate?: (date: Date) => void;
  onPrevRange?: () => void;
  onNextRange?: () => void;
  onMoveEvent?: (event: CalendarEventItem, targetDate: Date) => void;
}

const SLOT_HEIGHT_PX = 64;
const GRID_HEIGHT_PX = 768;

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

const hourGridBackground = {
  backgroundImage: 'linear-gradient(to bottom, rgba(148, 163, 184, 0.34) 1px, transparent 1px)',
  backgroundSize: '100% 64px',
};

export const WeekGrid: React.FC<WeekGridProps> = ({
  weekDays,
  fullWeekDays,
  selectedDate,
  events,
  onSelectEvent,
  onSelectDate,
  onPrevRange,
  onNextRange,
  onMoveEvent,
}) => {
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEventItem | null>(null);
  const [dragOverDayKey, setDragOverDayKey] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const lastWeekSwitchAtRef = useRef(0);
  const preserveDragAfterWeekSwitchRef = useRef(false);
  const clearPreservedDragTimerRef = useRef<number | null>(null);
  const language = useCurrentLanguage();
  const isDayView = weekDays.length === 1;
  const activeDay = weekDays[0];

  const handlePrevDay = () => {
    if (!selectedDate || !onSelectDate) return;
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onSelectDate(prev);
  };

  const handleNextDay = () => {
    if (!selectedDate || !onSelectDate) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onSelectDate(next);
  };
  const canDragEvent = (event: CalendarEventItem) => event.sourceType === 'EVENT' || event.sourceType === 'TASK';

  useEffect(() => {
    if (!draggedEvent) return;

    const handleWindowDragOver = (event: DragEvent) => {
      const shell = shellRef.current;
      if (!shell) return;
      event.preventDefault();

      const rect = shell.getBoundingClientRect();
      const now = Date.now();
      if (now - lastWeekSwitchAtRef.current < 750) return;

      const edgeThreshold = 56;
      const isPastRightEdge = event.clientX >= rect.right - edgeThreshold || event.clientX > rect.right;
      const isPastLeftEdge = event.clientX <= rect.left + edgeThreshold || event.clientX < rect.left;

      if (isPastRightEdge) {
        lastWeekSwitchAtRef.current = now;
        preserveDragAfterWeekSwitchRef.current = true;
        if (clearPreservedDragTimerRef.current) window.clearTimeout(clearPreservedDragTimerRef.current);
        clearPreservedDragTimerRef.current = window.setTimeout(() => {
          preserveDragAfterWeekSwitchRef.current = false;
        }, 1600);
        setDragOverDayKey(null);
        onNextRange?.();
      } else if (isPastLeftEdge) {
        lastWeekSwitchAtRef.current = now;
        preserveDragAfterWeekSwitchRef.current = true;
        if (clearPreservedDragTimerRef.current) window.clearTimeout(clearPreservedDragTimerRef.current);
        clearPreservedDragTimerRef.current = window.setTimeout(() => {
          preserveDragAfterWeekSwitchRef.current = false;
        }, 1600);
        setDragOverDayKey(null);
        onPrevRange?.();
      }
    };

    document.addEventListener('dragover', handleWindowDragOver, true);
    return () => document.removeEventListener('dragover', handleWindowDragOver, true);
  }, [draggedEvent, onNextRange, onPrevRange]);

  useEffect(() => {
    return () => {
      if (clearPreservedDragTimerRef.current) {
        window.clearTimeout(clearPreservedDragTimerRef.current);
      }
    };
  }, []);

  const getDropDateTime = (targetDate: Date, clientY: number, columnElement: HTMLDivElement) => {
    const rect = columnElement.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(GRID_HEIGHT_PX - 1, clientY - rect.top));
    const slotIndex = Math.max(0, Math.min(TIME_SLOTS.length - 2, Math.floor(offsetY / SLOT_HEIGHT_PX)));
    const target = new Date(targetDate);
    target.setHours(7 + slotIndex, 0, 0, 0);
    return target;
  };

  const handleDropOnDay = (targetDate: Date, clientY: number, columnElement: HTMLDivElement) => {
    if (!draggedEventId && !draggedEvent) return;
    const eventToMove = draggedEvent ?? events.find((event) => event.id === draggedEventId);
    const targetDateTime = getDropDateTime(targetDate, clientY, columnElement);
    preserveDragAfterWeekSwitchRef.current = false;
    if (clearPreservedDragTimerRef.current) window.clearTimeout(clearPreservedDragTimerRef.current);
    setDraggedEventId(null);
    setDraggedEvent(null);
    setDragOverDayKey(null);
    if (!eventToMove || !canDragEvent(eventToMove)) return;
    onMoveEvent?.(eventToMove, targetDateTime);
  };

  return (
    <div ref={shellRef} className="calendar-week-shell calendar-soft-scrollbar flex-1 w-full overflow-hidden rounded-[1.35rem] border shadow-sm">
      {/* 7-Day Quick Selector Strip (Visible in Day View) */}
      {isDayView && fullWeekDays && fullWeekDays.length > 0 && (
        <div className="calendar-day-strip border-b px-4 py-3 flex items-center gap-3 overflow-x-auto">
          <div className="calendar-day-strip-label flex items-center gap-1.5 text-xs font-extrabold shrink-0 pr-3 border-r">
            <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
            <span>Chọn ngày:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {fullWeekDays.map((d, index) => {
              const isSelected = selectedDate
                ? d.dateObj.toDateString() === selectedDate.toDateString()
                : d.isToday;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectDate?.(d.dateObj)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-cyan-500/25 scale-105 ring-2 ring-cyan-200 dark:ring-cyan-400/40'
                      : 'calendar-day-strip-button'
                  }`}
                >
                  <span className={isSelected ? 'text-cyan-50 font-medium' : 'calendar-day-strip-weekday'}>
                    {translate(language, d.dayKey as TranslationKey)}
                  </span>
                  <span className="text-xs font-black">{d.dateNum}</span>
                  {d.isToday && (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isSelected ? 'bg-emerald-400 ring-2 ring-white shadow-xs' : 'bg-emerald-500'
                      }`}
                      title="Hôm nay"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Header Row (Aligned 1-to-1 with grid columns below) */}
      {isDayView ? (
        <div
          style={{ gridTemplateColumns: '64px 1fr' }}
          className="calendar-week-header grid items-center border-b py-3 text-center"
        >
          <div className="flex items-center justify-center text-xs font-black text-slate-400">
            GMT+7
          </div>
          <div className="flex items-center justify-center gap-3 px-4">
            <button
              onClick={handlePrevDay}
              className="calendar-day-nav-button p-1.5 rounded-xl border shadow-xs transition-all cursor-pointer active:scale-95"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="calendar-day-title-pill flex items-center gap-2.5 px-4 py-1.5 rounded-2xl border shadow-xs">
              <span className="calendar-day-title-text text-xs sm:text-sm font-black tracking-tight font-heading uppercase">
                {translate(language, activeDay.dayKey as TranslationKey)}, {activeDay.dateNum} Thg {activeDay.dateObj.getMonth() + 1} {activeDay.dateObj.getFullYear()}
              </span>
              {activeDay.isToday && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-600 text-white shadow-xs">
                  Hôm nay
                </span>
              )}
              {activeDay.isWeekend && !activeDay.isToday && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                  Cuối tuần
                </span>
              )}
            </div>

            <button
              onClick={handleNextDay}
              className="calendar-day-nav-button p-1.5 rounded-xl border shadow-xs transition-all cursor-pointer active:scale-95"
              title="Ngày sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{ gridTemplateColumns: `64px repeat(${weekDays.length}, minmax(0, 1fr))` }}
          className="calendar-week-header relative grid border-b p-2 text-center"
        >
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={onPrevRange}
              className="calendar-week-nav-button flex h-9 w-9 items-center justify-center rounded-2xl border transition-all active:scale-95"
              title="Tuần trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          {weekDays.map((d, index) => {
            const isSelected = selectedDate
              ? d.dateObj.toDateString() === selectedDate.toDateString()
              : d.isToday;
            const isTodaySelected = isSelected && d.isToday;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectDate?.(d.dateObj)}
                className={`mx-1 flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all cursor-pointer ${
                  isTodaySelected
                    ? 'calendar-week-day-button-selected text-white shadow-md shadow-cyan-500/20 scale-[1.02]'
                    : isSelected
                    ? 'calendar-week-day-button-active'
                    : 'calendar-week-day-button-idle'
                }`}
              >
                <span
                  className={`text-[11px] font-black uppercase tracking-wider ${
                    isTodaySelected
                      ? 'text-cyan-50'
                      : isSelected
                      ? 'text-cyan-200'
                      : d.isWeekend
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {translate(language, d.dayKey as TranslationKey)}
                </span>
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-extrabold ${
                    isTodaySelected
                      ? 'text-white'
                      : isSelected
                      ? 'text-cyan-100'
                      : d.isToday
                      ? 'text-cyan-300'
                      : d.isWeekend
                      ? 'text-slate-400'
                      : 'text-slate-800'
                  }`}
                >
                  {d.dateNum}
                </span>
                {d.isToday && !isSelected && (
                  <span
                    className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.14)]"
                    title="Hôm nay"
                  />
                )}
              </button>
            );
          })}
          <div className="pointer-events-none absolute inset-y-0 right-3 z-20 flex items-center">
            <button
              type="button"
              onClick={onNextRange}
              className="calendar-week-nav-button pointer-events-auto flex h-9 w-9 items-center justify-center rounded-2xl border transition-all active:scale-95"
              title="Tuần tới"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid Body */}
      <div
        style={{ gridTemplateColumns: isDayView ? '64px 1fr' : `64px repeat(${weekDays.length}, minmax(0, 1fr))` }}
        className="calendar-week-body relative grid w-full h-[768px]"
      >
        {/* Left Time Labels */}
        <div className="calendar-week-time flex select-none flex-col border-r px-2 py-2 text-right">
          {TIME_SLOTS.map((time, idx) => (
            <div key={idx} className="flex h-16 items-start justify-center pt-2">
              <span className="calendar-time-pill rounded-full px-2 py-1 text-[11px] font-black tabular-nums text-slate-500">
                {time}
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {weekDays.map((day, dayIndex) => {
          const dayKey = day.dateObj.toDateString();
          const isDragOverDay = dragOverDayKey === dayKey;
          const dayEvents = events.filter((e) => e.dateKey === dayKey);

          return (
            <div
              key={dayIndex}
              onDragOver={(event) => {
                if (!draggedEventId) return;
                event.preventDefault();
                setDragOverDayKey(dayKey);
              }}
              onDragLeave={() => {
                if (dragOverDayKey === dayKey) setDragOverDayKey(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDropOnDay(day.dateObj, event.clientY, event.currentTarget);
              }}
              className={`calendar-week-day relative h-[768px] border-r last:border-r-0 transition-colors ${
                day.isToday
                  ? 'calendar-week-day-today'
                  : 'calendar-week-day-idle'
              } ${isDragOverDay ? 'calendar-week-day-drop-target' : ''}`}
              style={hourGridBackground}
            >
              {dayEvents.map((evt) => (
                (() => {
                  const isCompact = evt.heightPx <= 48;
                  const isDraggable = canDragEvent(evt);
                  return (
                    <div
                      key={evt.id}
                      draggable={isDraggable}
                      onDragStart={(event) => {
                        if (!isDraggable) return;
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', evt.id);
                        setDraggedEventId(evt.id);
                        setDraggedEvent(evt);
                      }}
                      onDragEnd={() => {
                        if (preserveDragAfterWeekSwitchRef.current) return;
                        setDraggedEventId(null);
                        setDraggedEvent(null);
                        setDragOverDayKey(null);
                      }}
                      onClick={() => onSelectEvent?.(evt)}
                      title={isDraggable ? 'Kéo sang ô ngày/giờ khác' : undefined}
                      className={`group absolute left-2.5 right-2.5 z-10 flex ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${isCompact ? 'flex-col justify-center gap-0.5' : 'flex-col justify-between'} overflow-hidden rounded-lg border-l-[4px] shadow-md shadow-slate-950/10 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${draggedEventId === evt.id ? 'opacity-60 ring-2 ring-cyan-300' : ''} ${isCompact ? 'px-2.5 py-1' : 'p-3'}`}
                      style={{
                        top: `${evt.startTopPx + 8}px`,
                        height: `${evt.heightPx}px`,
                        backgroundColor: evt.bgColor,
                        color: evt.textColor,
                        borderColor: evt.color,
                      }}
                    >
                      <div className={isCompact ? 'min-w-0 flex-1' : 'flex min-w-0 flex-col'}>
                        <div className="flex items-start justify-between gap-2">
                          <span className={`${isCompact ? 'block truncate text-[11px] leading-tight' : 'line-clamp-2 text-xs leading-snug sm:text-sm'} font-extrabold`}>{evt.title}</span>
                          {evt.hasConflict && (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </div>
                        {evt.location && !isCompact && (
                          <span className="text-xs font-medium opacity-90 truncate flex items-center gap-1.5 mt-1">
                            {evt.location.includes('Meet') || evt.location.includes('Online') ? (
                              <Video className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                            )}
                            {evt.location}
                          </span>
                        )}
                      </div>
                      <span className={`${isCompact ? 'truncate text-[10px] leading-none' : 'text-[11px] mt-1'} font-black opacity-85`}>{evt.timeRange}</span>
                    </div>
                  );
                })()
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};










