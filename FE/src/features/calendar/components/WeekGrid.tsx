import React from 'react';
import { MapPin, Video, AlertTriangle } from 'lucide-react';
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
  const headerDays = isDayView && fullWeekDays ? fullWeekDays : weekDays;

  return (
    <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-w-0">
      {/* 7-Day Header Selector Row */}
      <div
        style={{ gridTemplateColumns: `64px repeat(${headerDays.length}, minmax(0, 1fr))` }}
        className="grid bg-slate-50/80 border-b border-slate-200/80 py-3 text-center"
      >
        <div className="flex items-center justify-center text-xs font-black text-slate-400">
          GMT+7
        </div>
        {headerDays.map((d, index) => {
          const isSelected = isDayView && selectedDate
            ? d.dateObj.toDateString() === selectedDate.toDateString()
            : d.isToday;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectDate?.(d.dateObj)}
              className={`flex flex-col items-center gap-1 py-1.5 transition-all cursor-pointer rounded-xl mx-1 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'hover:bg-slate-200/60'
              }`}
            >
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  isSelected
                    ? 'text-indigo-100'
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

      {/* Grid Body */}
      <div
        style={{ gridTemplateColumns: isDayView ? '64px 1fr' : `64px repeat(${weekDays.length}, minmax(0, 1fr))` }}
        className="relative grid w-full min-h-[832px]"
      >
        {/* Left Time Labels */}
        <div className="flex flex-col text-right pr-3 py-2 bg-slate-50/40 select-none border-r border-slate-200/80">
          {TIME_SLOTS.map((time, idx) => (
            <div key={idx} className="h-16 flex items-start justify-end text-xs font-bold text-slate-400">
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
              className={`relative h-[832px] border-r border-slate-200/60 last:border-r-0 ${
                day.isToday ? 'bg-indigo-50/20' : ''
              }`}
            >
              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent?.(evt)}
                  className="absolute left-2 right-2 rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group z-10 hover:-translate-y-0.5"
                  style={{
                    top: `${evt.startTopPx}px`,
                    height: `${evt.heightPx}px`,
                    backgroundColor: evt.bgColor,
                    color: evt.textColor,
                    borderLeft: `5px solid ${evt.color}`,
                  }}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-extrabold truncate">{evt.title}</span>
                      {evt.hasConflict && (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </div>
                    {evt.location && (
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
                  <span className="text-[11px] font-black opacity-85 mt-1">{evt.timeRange}</span>
                </div>
              ))}

              {dayEvents.length === 0 && (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold select-none">
                      {day.isWeekend ? translate(language, 'calendar.rest') : translate(language, 'calendar.emptySlot')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


