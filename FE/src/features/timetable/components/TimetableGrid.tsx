import React from 'react';
import { MapPin, Plus, User, Sparkles } from 'lucide-react';
import type { TimetableClassItem } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';

export interface TimetableGridProps {
  classes: TimetableClassItem[];
  onSelectClass: (cls: TimetableClassItem) => void;
  onQuickAdd?: (dayIndex: number, startSlot: number) => void;
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

export const TimetableGrid: React.FC<TimetableGridProps> = ({ classes, onSelectClass, onQuickAdd }) => {
  const slotHeightPx = 68;
  const gridHeightPx = SLOTS.length * slotHeightPx;
  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const language = useCurrentLanguage();

  const isSlotOccupied = (dayClasses: TimetableClassItem[], slotNum: number) =>
    dayClasses.some((cls) => slotNum >= cls.startSlot && slotNum < cls.startSlot + cls.slotSpan);

  const getSlotTop = (slotNum: number) => (slotNum - 1) * slotHeightPx;

  return (
    <div className="w-full min-w-[900px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      {/* Table Days Header */}
      <div className="grid grid-cols-8 border-b border-slate-100 bg-white text-center">
        <div className="flex flex-col items-center justify-center text-xs font-black text-slate-400 uppercase tracking-wider">
          {translate(language, 'timetable.periodHeader')}
        </div>
        {DAYS.map((d, i) => (
          <div
            key={i}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 border-l border-slate-100 transition-colors ${
              i === todayDayIndex ? 'bg-indigo-50 text-indigo-700' : 'bg-white'
            }`}
          >
            <span className={`text-xs font-extrabold font-heading ${i === todayDayIndex ? 'text-indigo-700' : 'text-slate-800'}`}>
              {translate(language, d.labelKey as TranslationKey)}
            </span>
            {i === todayDayIndex && (
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Hôm nay
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Grid Container */}
      <div className="relative grid w-full grid-cols-8" style={{ minHeight: `${gridHeightPx}px` }}>
        {/* Left Slots Column */}
        <div className="flex flex-col border-r border-slate-100 bg-slate-50/50 select-none">
          {SLOTS.map((slot) => (
            <div
              key={slot.num}
              style={{ height: `${slotHeightPx}px` }}
              className="flex flex-col justify-center items-center px-2 border-b border-slate-100 text-center"
            >
              <span className="text-xs font-extrabold text-slate-900">
                {translate(language, 'timetable.period')} {slot.num}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{slot.time}</span>
            </div>
          ))}
        </div>

        {/* 7 Day Columns */}
        {DAYS.map((_, dayIndex) => {
          const dayClasses = classes.filter((c) => c.dayIndex === dayIndex);

          return (
            <div
              key={dayIndex}
              className={`relative border-r border-slate-100 transition-colors last:border-r-0 ${
                dayIndex === todayDayIndex
                  ? 'bg-indigo-950/[0.025] shadow-[inset_0_0_0_2px_rgba(99,102,241,0.22)]'
                  : 'bg-white hover:bg-slate-50/50'
              }`}
              style={{ height: `${gridHeightPx}px` }}
            >
              {/* Background slot grid lines */}
              {SLOTS.map((slot) => (
                <button
                  key={slot.num}
                  type="button"
                  onClick={() => !isSlotOccupied(dayClasses, slot.num) && onQuickAdd?.(dayIndex, slot.num)}
                  disabled={isSlotOccupied(dayClasses, slot.num)}
                  style={{ height: `${slotHeightPx}px` }}
                  className={`group relative block w-full border-b border-slate-100 text-left transition-all ${
                    isSlotOccupied(dayClasses, slot.num)
                      ? 'cursor-default'
                      : 'cursor-pointer hover:bg-indigo-500/[0.08] hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.28)]'
                  }`}
                  aria-label={`Thêm môn học ${translate(language, DAYS[dayIndex].labelKey as TranslationKey)} tiết ${slot.num}`}
                >
                  {!isSlotOccupied(dayClasses, slot.num) && (
                    <span className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-2xl border border-dashed border-indigo-300/0 text-indigo-300 opacity-0 transition-all group-hover:border-indigo-300/50 group-hover:bg-indigo-500/10 group-hover:opacity-100">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                        <Plus className="h-4 w-4" />
                      </span>
                    </span>
                  )}
                </button>
              ))}

              {/* Class Cards overlay */}
              {dayClasses.map((cls) => {
                const topPx = getSlotTop(cls.startSlot) + 4;
                const heightPx = cls.slotSpan * slotHeightPx - 8;

                return (
                  <div
                    key={cls.id}
                    onClick={() => onSelectClass(cls)}
                    className="group absolute left-2 right-2 z-10 flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-3 shadow-md ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    style={{
                      top: `${topPx}px`,
                      height: `${heightPx}px`,
                      background: `linear-gradient(135deg, ${cls.bgColor}, #ffffff)`,
                      color: cls.textColor,
                      borderTop: `3px solid ${cls.color}`,
                    }}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                          {cls.typeLabel}
                        </span>
                        <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-bold opacity-75">{cls.courseCode}</span>
                      </div>

                      <h4 className="line-clamp-2 text-sm font-extrabold leading-snug group-hover:underline">
                        {cls.subjectName}
                      </h4>

                      <div className="mt-2 flex flex-col gap-1 text-[11px] opacity-90">
                        <span className="flex items-center gap-1 font-semibold truncate">
                          <User className="w-3 h-3 shrink-0" />
                          {cls.lecturer}
                        </span>
                        <span className="flex items-center gap-1 font-medium truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {cls.room}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/10 pt-1 mt-1 text-[10px] font-black opacity-80">
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
