import React, { useEffect, useRef } from 'react';
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
} from '../utils/timetableTime';

export interface TimetableGridProps {
  classes: TimetableClassItem[];
  onSelectClass: (cls: TimetableClassItem) => void;
  onQuickAdd?: (dayIndex: number, startTime: string) => void;
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

export const TimetableGrid: React.FC<TimetableGridProps> = ({ classes, onSelectClass, onQuickAdd }) => {
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
      className="w-full min-w-[900px] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
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
          <div className="flex h-14 items-center justify-center border-r border-[var(--color-border)] text-[11px] font-black uppercase tracking-wide text-[var(--color-text-muted)]">
            {translate(language, 'timetable.timeHeader')}
          </div>
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
          <div className="flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-container)] select-none">
            {hourRows.map((row) => (
              <div
                key={row.startMinutes}
                style={{ height: `${TIMETABLE_HOUR_HEIGHT_PX}px` }}
                className="flex items-center justify-center border-b border-[var(--color-border)] px-1 text-center"
              >
                <span className="text-[11px] font-extrabold tabular-nums text-[var(--color-text-main)]">
                  {row.label}
                </span>
              </div>
            ))}
          </div>

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
                      disabled={!available}
                      style={{ height: `${TIMETABLE_HOUR_HEIGHT_PX}px` }}
                      className={`group relative flex w-full items-center justify-center border-b border-[var(--color-border)] transition-colors ${
                        available
                          ? 'cursor-pointer hover:bg-indigo-500/10'
                          : 'cursor-default'
                      }`}
                      aria-label={`${translate(language, 'timetable.addSubject')} ${translate(language, DAYS[dayIndex].labelKey as TranslationKey)} ${startTime}`}
                    >
                      {available && (
                        <span className="pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white opacity-0 shadow-lg shadow-indigo-600/30 transition-opacity group-hover:opacity-100">
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
                  const heightPx = Math.max(44, durationToHeightPx(start, end) - 6);
                  const compact = heightPx < 64;

                  return (
                    <div
                      key={cls.id}
                      onClick={() => onSelectClass(cls)}
                      className="group absolute left-1.5 right-1.5 z-10 flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl p-2.5 shadow-md ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        background: `linear-gradient(135deg, ${cls.bgColor}, #ffffff)`,
                        color: cls.textColor,
                        borderTop: `3px solid ${cls.color}`,
                      }}
                    >
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center justify-between gap-1">
                          <span className="shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-900">
                            {cls.typeLabel}
                          </span>
                          {!compact && (
                            <span className="truncate text-[10px] font-bold opacity-75">{cls.courseCode}</span>
                          )}
                        </div>

                        <h4 className="line-clamp-2 text-sm font-extrabold leading-snug group-hover:underline">
                          {cls.subjectName}
                        </h4>

                        {!compact && (
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

                      <div className="mt-1 flex items-center justify-between border-t border-black/10 pt-1 text-[10px] font-black opacity-85">
                        <span>{cls.timeRange}</span>
                        <Sparkles className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
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
