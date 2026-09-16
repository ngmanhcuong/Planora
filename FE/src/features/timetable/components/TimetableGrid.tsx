import React from 'react';
import { MapPin, User, Sparkles } from 'lucide-react';
import type { TimetableClassItem } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';

export interface TimetableGridProps {
  classes: TimetableClassItem[];
  onSelectClass: (cls: TimetableClassItem) => void;
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

const SLOTS = [
  { num: 1, time: '07:00 - 07:45' },
  { num: 2, time: '07:50 - 08:35' },
  { num: 3, time: '08:40 - 09:25' },
  { num: 4, time: '09:35 - 10:20' },
  { num: 5, time: '10:25 - 11:10' },
  { num: 6, time: '11:15 - 12:00' },
  { num: 7, time: '13:00 - 13:45' },
  { num: 8, time: '13:50 - 14:35' },
  { num: 9, time: '14:40 - 15:25' },
  { num: 10, time: '15:35 - 16:20' },
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({ classes, onSelectClass }) => {
  const slotHeightPx = 68;
  const language = useCurrentLanguage();

  return (
    <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col min-w-[800px]">
      {/* Table Days Header */}
      <div className="grid grid-cols-8 bg-[#F8FAFC] border-b border-[#E2E8F0] py-3 text-center">
        <div className="flex flex-col items-center justify-center text-xs font-bold text-[#64748B] uppercase tracking-wider">
          {translate(language, 'timetable.periodHeader')}
        </div>
        {DAYS.map((d, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-0.5">
            <span className="text-xs font-bold text-[#131B2E] font-heading">
              {translate(language, d.labelKey as TranslationKey)}
            </span>
          </div>
        ))}
      </div>

      {/* Grid Container */}
      <div className="relative grid grid-cols-8 w-full min-h-[680px]">
        {/* Left Slots Column */}
        <div className="flex flex-col border-r border-[#E2E8F0] bg-[#F8FAFC]/50 select-none">
          {SLOTS.map((slot) => (
            <div
              key={slot.num}
              style={{ height: `${slotHeightPx}px` }}
              className="flex flex-col justify-center items-center px-2 border-b border-[#E2E8F0]/60 last:border-b-0 text-center"
            >
              <span className="text-xs font-bold text-[#131B2E]">
                {translate(language, 'timetable.period')} {slot.num}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">{slot.time}</span>
            </div>
          ))}
        </div>

        {/* 7 Day Columns */}
        {DAYS.map((_, dayIndex) => {
          const dayClasses = classes.filter((c) => c.dayIndex === dayIndex);

          return (
            <div
              key={dayIndex}
              className="relative h-[680px] border-r border-[#E2E8F0] last:border-r-0"
            >
              {/* Background slot grid lines */}
              {SLOTS.map((slot) => (
                <div
                  key={slot.num}
                  style={{ height: `${slotHeightPx}px` }}
                  className="border-b border-[#E2E8F0]/60 last:border-b-0"
                />
              ))}

              {/* Class Cards overlay */}
              {dayClasses.map((cls) => {
                const topPx = (cls.startSlot - 1) * slotHeightPx + 4;
                const heightPx = cls.slotSpan * slotHeightPx - 8;

                return (
                  <div
                    key={cls.id}
                    onClick={() => onSelectClass(cls)}
                    className="absolute left-1.5 right-1.5 rounded-lg p-2.5 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group z-10"
                    style={{
                      top: `${topPx}px`,
                      height: `${heightPx}px`,
                      backgroundColor: cls.bgColor,
                      color: cls.textColor,
                      borderLeft: `4px solid ${cls.color}`,
                    }}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/60 text-[#131B2E] shrink-0">
                          {cls.typeLabel}
                        </span>
                        <span className="text-[10px] font-semibold opacity-75">{cls.courseCode}</span>
                      </div>

                      <h4 className="text-xs font-bold leading-snug line-clamp-2 group-hover:underline">
                        {cls.subjectName}
                      </h4>

                      <div className="flex flex-col gap-0.5 mt-1 text-[11px] opacity-90">
                        <span className="flex items-center gap-1 font-medium truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {cls.room}
                        </span>
                        <span className="flex items-center gap-1 font-medium truncate">
                          <User className="w-3 h-3 shrink-0" />
                          {cls.lecturer}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/10 pt-1 mt-1 text-[10px] font-semibold opacity-80">
                      <span>{cls.timeRange}</span>
                      <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
