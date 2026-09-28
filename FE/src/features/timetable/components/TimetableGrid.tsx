import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Plus, User, Sparkles } from 'lucide-react';
import type { TimetableClassItem } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';
import {
  TIMETABLE_GRID_MAX_HEIGHT_PX,
  TIMETABLE_GRID_TEMPLATE,
  TIMETABLE_HOUR_HEIGHT_PX,
  clampEventMinutes,
  durationToHeightPx,
  getHourRows,
  getTimetableGridHeightPx,
  isHourAvailable,
  minutesToTopPx,
  parseTimeToMinutes,
  TIMETABLE_GRID_START,
  minutesToTimeString,
} from '../utils/timetableTime';

export interface TimetableGridProps {
  classes: TimetableClassItem[];
  onSelectClass: (cls: TimetableClassItem) => void;
  onQuickAdd?: (dayIndex: number, startTime: string) => void;
  onMoveClass?: (cls: TimetableClassItem, dayIndex: number, startTime: string) => void;
  isMoving?: boolean;
}

const DAYS = [
  { labelKey: 'weekday.mon' },
  { labelKey: 'weekday.tue' },
  { labelKey: 'weekday.wed' },
  { labelKey: 'weekday.thu' },
  { labelKey: 'weekday.fri' },
  { labelKey: 'weekday.sat' },
  { labelKey: 'weekday.sun' },
];

const gridStyle = { gridTemplateColumns: TIMETABLE_GRID_TEMPLATE };

export const TimetableGrid: React.FC<TimetableGridProps> = ({ classes, onSelectClass, onQuickAdd, onMoveClass, isMoving }) => {
  const [dragged, setDragged] = useState<TimetableClassItem | null>(null);
  const [target, setTarget] = useState<{ day: number; minutes: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const dropMinutes = (element: HTMLDivElement, clientY: number) =>
    TIMETABLE_GRID_START + Math.max(0, Math.min(13, Math.floor((clientY - element.getBoundingClientRect().top) / TIMETABLE_HOUR_HEIGHT_PX))) * 60;
  const gridHeightPx = getTimetableGridHeightPx();
  const hourRows = getHourRows();
  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const language = useCurrentLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = minutesToTopPx(8 * 60);
  }, []);

  return (
    <div
      className="isolate w-full min-w-[900px] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
    >
      <div
        ref={scrollRef}
        className="overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-color:#C7D2FE_transparent] [scrollbar-width:thin]"
        style={{ maxHeight: `${TIMETABLE_GRID_MAX_HEIGHT_PX}px` }}
      >
        <div
          className="sticky top-0 z-20 grid border-b border-[var(--color-border)] bg-[var(--color-surface)] text-center shadow-[0_1px_0_var(--color-border)]"
          style={gridStyle}
        >
          {DAYS.map((d, i) => {
            const isToday = i === todayDayIndex;
            return (
              <div
                key={i}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 border-r border-[var(--color-border)] last:border-r-0 ${
                  isToday ? 'bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/35' : ''
                }`}
              >
                <span className={`text-xs font-extrabold font-heading ${isToday ? 'text-indigo-600 dark:text-indigo-300' : 'text-[var(--color-text-main)]'}`}>
                  {translate(language, d.labelKey as TranslationKey)}
                </span>
                <span className={`text-[10px] font-bold leading-none ${isToday ? 'text-indigo-600 dark:text-indigo-300' : 'invisible'}`}>
                  {translate(language, 'timetable.today')}
                </span>
              </div>
            );
          })}
        </div>

        <div className="relative grid" style={{ ...gridStyle, height: `${gridHeightPx}px` }}>

          {DAYS.map((_, dayIndex) => {
            const dayClasses = classes.filter((c) => c.dayIndex === dayIndex);
            const isToday = dayIndex === todayDayIndex;
            const dayEvents = dayClasses.map((cls) => {
              const { start, end } = clampEventMinutes(
                parseTimeToMinutes(cls.startTime),
                parseTimeToMinutes(cls.endTime)
              );
              return { startMinutes: start, endMinutes: end };
            });

            return (
              <div
                key={dayIndex}
                onDragOver={(event) => {
                  if (!dragged || isMoving) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  const minutes = dropMinutes(event.currentTarget, event.clientY);
                  setTarget(previous => previous?.day === dayIndex && previous.minutes === minutes ? previous : { day: dayIndex, minutes });
                }}
                onDrop={(event) => {
                  if (!dragged || isMoving) return;
                  event.preventDefault();
                  onMoveClass?.(dragged, dayIndex, minutesToTimeString(dropMinutes(event.currentTarget, event.clientY)));
                  setDragged(null);
                  setTarget(null);
                  suppressClickUntil.current = Date.now() + 300;
                }}
                className={`relative border-r border-[var(--color-border)] last:border-r-0 ${
                  isToday
                    ? 'bg-indigo-500/[0.06] ring-1 ring-inset ring-indigo-500/25'
                    : 'bg-[var(--color-surface)]'
                }`}
                style={{ height: `${gridHeightPx}px` }}
              >
                {hourRows.map((row) => {
                  const available = isHourAvailable(dayEvents, row.startMinutes);
                  const startTime = row.label;

                  return (
                    <button
                      key={row.startMinutes}
                      type="button"
                      onClick={() => available && onQuickAdd?.(dayIndex, startTime)}
                      disabled={!available && !dragged}
                      style={{ height: `${TIMETABLE_HOUR_HEIGHT_PX}px` }}
                      className={`group relative flex w-full items-center justify-center overflow-hidden border-b border-[var(--color-border)] p-3 transition-colors ${
                        available
                          ? 'cursor-pointer hover:bg-indigo-500/10'
                          : 'cursor-default'
                      }`}
                      aria-label={`${translate(language, 'timetable.addSubject')} ${translate(language, DAYS[dayIndex].labelKey as TranslationKey)} ${startTime}`}
                    >
                      {target?.day === dayIndex && target.minutes === row.startMinutes ? (
                        <span className="pointer-events-none absolute inset-1 flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-500/20 text-xs font-bold text-indigo-500">{row.label}</span>
                      ) : available && !dragged && (
                        <span className="pointer-events-none flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white opacity-0 shadow-md shadow-indigo-600/30 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                          <Plus className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}

                {dayClasses.map((cls) => {
                  const startMinutes = parseTimeToMinutes(cls.startTime);
                  const endMinutes = parseTimeToMinutes(cls.endTime);
                  const { start, end } = clampEventMinutes(startMinutes, endMinutes);
                  const topPx = minutesToTopPx(start) + 3;
                  // Keep the summary card within one grid row, even for longer classes.
                  // The actual duration remains available in the time label and detail popup.
                  const heightPx = Math.max(20, Math.min(TIMETABLE_HOUR_HEIGHT_PX - 6, durationToHeightPx(start, end) - 6));
                  const compact = heightPx < 80;
                  const showDetails = heightPx >= 140;

                  return (
                    <button
                      type="button"
                      key={cls.id}
                      draggable={!!onMoveClass && !isMoving}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', cls.id);
                        setDragged(cls);
                      }}
                      onDragEnd={() => {
                        setDragged(null);
                        setTarget(null);
                        suppressClickUntil.current = Date.now() + 300;
                      }}
                      onClick={() => { if (Date.now() >= suppressClickUntil.current) onSelectClass(cls); }}
                      aria-label={`Xem chi tiết ${cls.subjectName}, ${cls.timeRange}`}
                      aria-haspopup="dialog"
                      title={`${cls.subjectName} · ${cls.timeRange} — Bấm để xem chi tiết`}
                      className={`group absolute left-1 right-1 z-10 flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg text-left shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${compact ? 'justify-center gap-0.5 px-2 py-0.5' : 'justify-between p-2'}`}
                      style={{
                        cursor: isMoving ? 'wait' : 'grab',
                        opacity: dragged?.id === cls.id ? 0.5 : 1,
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        background: `linear-gradient(135deg, ${cls.bgColor}, #ffffff)`,
                        color: cls.textColor,
                        borderTop: `3px solid ${cls.color}`,
                      }}
                    >
                      <div className="min-w-0">
                        {!compact && <div className="mb-1 flex min-w-0 items-center gap-1">
                          <span className="min-w-0 truncate rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-900">
                            {cls.typeLabel}
                          </span>
                        </div>}

                        <span className={`block font-extrabold leading-tight group-hover:underline ${compact ? 'truncate text-xs' : 'line-clamp-2 break-words text-sm'}`}>
                          {cls.subjectName}
                        </span>

                        {showDetails && (
                          <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] font-medium opacity-90">
                            <span className="flex items-center gap-1 truncate">
                              <User className="h-3 w-3 shrink-0" />
                              {cls.lecturer}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {cls.room}
                            </span>
                          </div>
                        )}
                      </div>

                      {heightPx >= 36 && <div className={`flex shrink-0 items-center gap-1 text-[10px] font-bold leading-tight opacity-85 ${compact ? '' : 'mt-1 border-t border-black/10 pt-1'}`}>
                        <span className="min-w-0 truncate">{cls.timeRange}</span>
                        {!compact && <Sparkles className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />}
                      </div>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
