import React from 'react';
import { MapPin, Video, AlertTriangle } from 'lucide-react';
import type { CalendarEventItem } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';

export interface WeekGridProps {
  events: CalendarEventItem[];
  onSelectEvent?: (event: CalendarEventItem) => void;
}

const DAYS_HEADER = [
  { dayKey: 'weekday.mon', dateNum: 14, isToday: true },
  { dayKey: 'weekday.tue', dateNum: 15, isToday: false },
  { dayKey: 'weekday.wed', dateNum: 16, isToday: false },
  { dayKey: 'weekday.thu', dateNum: 17, isToday: false },
  { dayKey: 'weekday.fri', dateNum: 18, isToday: false },
  { dayKey: 'weekday.sat', dateNum: 19, isToday: false, isWeekend: true },
  { dayKey: 'weekday.sun', dateNum: 20, isToday: false, isWeekend: true },
];

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export const WeekGrid: React.FC<WeekGridProps> = ({ events, onSelectEvent }) => {
  const language = useCurrentLanguage();

  return (
    <div className="flex-1 w-full bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col min-w-0">
      {/* Week Days Header Row */}
      <div className="grid grid-cols-8 bg-[#F8FAFC] border-b border-[#E2E8F0] py-2.5 text-center">
        <div className="flex items-center justify-center text-xs font-semibold text-[#64748B]">
          GMT+7
        </div>
        {DAYS_HEADER.map((d, index) => (
          <div
            key={index}
            className={`flex flex-col items-center gap-0.5 py-1 ${
              d.isToday ? 'bg-white rounded-lg mx-1 shadow-2xs' : ''
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                d.isToday
                  ? 'text-[#4F46E5]'
                  : d.isWeekend
                  ? 'text-[#94A3B8]'
                  : 'text-[#64748B]'
              }`}
            >
              {translate(language, d.dayKey as TranslationKey)}
            </span>
            <span
              className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
                d.isToday
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : d.isWeekend
                  ? 'text-[#94A3B8]'
                  : 'text-[#131B2E]'
              }`}
            >
              {d.dateNum}
            </span>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="relative grid grid-cols-8 w-full min-h-[832px]">
        {/* Left Time Labels */}
        <div className="flex flex-col text-right pr-3 py-2 bg-[#F8FAFC]/50 select-none border-r border-[#E2E8F0]">
          {TIME_SLOTS.map((time, idx) => (
            <div key={idx} className="h-16 flex items-start justify-end text-xs font-semibold text-[#64748B]">
              {time}
            </div>
          ))}
        </div>

        {/* 7 Day Columns */}
        {DAYS_HEADER.map((day, dayIndex) => {
          const dayEvents = events.filter((e) => e.dayIndex === dayIndex);

          return (
            <div
              key={dayIndex}
              className={`relative h-[832px] border-r border-[#E2E8F0] last:border-r-0 ${
                day.isToday ? 'bg-[#EEF2FF]/20' : ''
              }`}
            >
              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent?.(evt)}
                  className="absolute left-1 right-1 rounded-lg p-2 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-sm transition-all cursor-pointer group z-10"
                  style={{
                    top: `${evt.startTopPx}px`,
                    height: `${evt.heightPx}px`,
                    backgroundColor: evt.bgColor,
                    color: evt.textColor,
                    borderLeft: `4px solid ${evt.color}`,
                  }}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{evt.title}</span>
                      {evt.hasConflict && (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#F43F5E] shrink-0" />
                      )}
                    </div>
                    {evt.location && (
                      <span className="text-[11px] opacity-90 truncate flex items-center gap-1 mt-0.5">
                        {evt.location.includes('Meet') || evt.location.includes('Online') ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <MapPin className="w-3 h-3" />
                        )}
                        {evt.location}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold opacity-80">{evt.timeRange}</span>
                </div>
              ))}

              {dayEvents.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <span className="text-[11px] text-[#94A3B8] select-none">
                    {day.isWeekend ? translate(language, 'calendar.rest') : translate(language, 'calendar.emptySlot')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
