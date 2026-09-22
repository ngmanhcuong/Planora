import React from 'react';
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
}

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

const hourGridBackground = {
  backgroundImage: 'linear-gradient(to bottom, rgba(148, 163, 184, 0.28) 1px, transparent 1px)',
  backgroundSize: '100% 64px',
};

export const WeekGrid: React.FC<WeekGridProps> = ({
  weekDays,
  fullWeekDays,
  selectedDate,
  events,
  onSelectEvent,
  onSelectDate,
}) => {
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

  return (
    <div className="flex-1 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* 7-Day Quick Selector Strip (Visible in Day View) */}
      {isDayView && fullWeekDays && fullWeekDays.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 via-white to-violet-50 border-b border-slate-200/80 px-4 py-3 flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 shrink-0 pr-3 border-r border-slate-200">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
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
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-cyan-500/25 scale-105 ring-2 ring-cyan-200'
                      : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-cyan-50/70 hover:text-cyan-700 hover:border-cyan-200'
                  }`}
                >
                  <span className={isSelected ? 'text-cyan-50 font-medium' : 'text-slate-400 font-medium'}>
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
          className="grid items-center border-b border-slate-100 bg-white py-3 text-center"
        >
          <div className="flex items-center justify-center text-xs font-black text-slate-400">
            GMT+7
          </div>
          <div className="flex items-center justify-center gap-3 px-4">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white border border-slate-200/80 bg-white shadow-xs transition-all cursor-pointer active:scale-95"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight font-heading uppercase">
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
              className="p-1.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white border border-slate-200/80 bg-white shadow-xs transition-all cursor-pointer active:scale-95"
              title="Ngày sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{ gridTemplateColumns: `64px repeat(${weekDays.length}, minmax(0, 1fr))` }}
          className="grid border-b border-slate-100 bg-white py-3 text-center"
        >
          <div className="flex items-center justify-center text-xs font-black text-slate-400">
            GMT+7
          </div>
          {weekDays.map((d, index) => {
            const isSelected = selectedDate
              ? d.dateObj.toDateString() === selectedDate.toDateString()
              : d.isToday;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectDate?.(d.dateObj)}
                className={`flex flex-col items-center gap-1 py-1.5 transition-all cursor-pointer rounded-xl mx-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-cyan-500/20 scale-[1.02]'
                    : 'hover:bg-cyan-50/80'
                }`}
              >
                <span
                  className={`text-[11px] font-black uppercase tracking-wider ${
                    isSelected
                      ? 'text-cyan-50'
                      : d.isWeekend
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {translate(language, d.dayKey as TranslationKey)}
                </span>
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-extrabold ${
                    isSelected
                      ? 'text-white'
                      : d.isToday
                      ? 'bg-indigo-100 text-indigo-700'
                      : d.isWeekend
                      ? 'text-slate-400'
                      : 'text-slate-800'
                  }`}
                >
                  {d.dateNum}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid Body */}
      <div
        style={{ gridTemplateColumns: isDayView ? '64px 1fr' : `64px repeat(${weekDays.length}, minmax(0, 1fr))` }}
        className="relative grid w-full min-h-[832px] bg-white"
      >
        {/* Left Time Labels */}
        <div className="flex select-none flex-col border-r border-slate-200 bg-slate-50/70 py-2 pr-3 text-right">
          {TIME_SLOTS.map((time, idx) => (
            <div key={idx} className="flex h-16 items-start justify-end text-xs font-bold text-slate-400">
              {time}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {weekDays.map((day, dayIndex) => {
          const dayEvents = events.filter((e) => e.dateKey === day.dateObj.toDateString());

          return (
            <div
              key={dayIndex}
              className={`relative h-[832px] border-r border-slate-200 last:border-r-0 transition-colors ${
                day.isToday
                  ? 'bg-cyan-50/45'
                  : 'bg-white hover:bg-slate-50/60'
              }`}
              style={hourGridBackground}
            >
              {dayEvents.map((evt) => (
                (() => {
                  const isCompact = evt.heightPx <= 64;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent?.(evt)}
                      className={`group absolute left-2 right-2 z-10 flex cursor-pointer flex-col justify-between overflow-hidden rounded-lg border-l-4 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isCompact ? 'p-2.5' : 'p-3'}`}
                      style={{
                        top: `${evt.startTopPx}px`,
                        height: `${evt.heightPx}px`,
                        backgroundColor: evt.bgColor,
                        color: evt.textColor,
                        borderColor: evt.color,
                      }}
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`${isCompact ? 'line-clamp-2 text-xs leading-tight' : 'line-clamp-2 text-xs leading-snug sm:text-sm'} font-extrabold`}>{evt.title}</span>
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
                      <span className={`${isCompact ? 'text-[10px] leading-none' : 'text-[11px] mt-1'} font-black opacity-85`}>{evt.timeRange}</span>
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
