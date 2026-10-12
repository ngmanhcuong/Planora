import React, { useState } from 'react';
import type { CalendarEventItem } from '../types';
import { getStartOfWeek, getEndOfWeek, getWeekDays } from '@/utils/dateUtils';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  X,
  ExternalLink,
  Edit3,
  CalendarDays,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface MonthGridProps {
  currentDate: Date;
  events: CalendarEventItem[];
  onSelectDay: (date: Date) => void;
  onSelectEvent?: (event: CalendarEventItem) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  currentDate,
  events,
  onSelectDay,
  onSelectEvent,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  const language = useCurrentLanguage();
  // State for Day Details Popup Modal
  const [activePopupDate, setActivePopupDate] = useState<Date | null>(null);

  const start = getStartOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const end = getEndOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
  const days: Date[] = [];
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day));
  }

  const todayStr = new Date().toDateString();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Events belonging to activePopupDate
  const popupEvents = activePopupDate
    ? events.filter((e) => e.dateKey === activePopupDate.toDateString())
    : [];

  const handleCellClick = (day: Date) => {
    setActivePopupDate(day);
  };

  const handleEventClick = (e: React.MouseEvent, eventItem: CalendarEventItem) => {
    e.stopPropagation();
    setActivePopupDate(null);
    if (onSelectEvent) {
      onSelectEvent(eventItem);
    } else {
      onSelectDay(new Date(eventItem.startAt));
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-3.5">
      {/* Top Month Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/90 p-1 dark:bg-slate-800/90">
            <button
              type="button"
              onClick={onPrevMonth}
              aria-label="Tháng trước"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-xs rounded-md dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              aria-label="Tháng sau"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Tháng {currentMonth + 1}, {currentYear}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-semibold dark:bg-slate-800">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            Tổng {events.length} lịch trình trong tháng
          </span>
        </div>
      </div>

      {/* Main Month Calendar Grid Shell */}
      <div className="calendar-month-shell w-full min-w-0 overflow-x-auto rounded-3xl border shadow-lg">
        <div className="min-w-[760px]">
          {/* Weekday headers */}
          <div className="calendar-month-weekdays grid grid-cols-7 border-b border-slate-200/80 text-center text-xs font-black uppercase tracking-wider dark:border-slate-800">
            {getWeekDays(start).map((day, idx) => {
              const isWeekendHeader = idx >= 5;
              return (
                <div
                  key={day.dayKey}
                  className={`p-3.5 ${isWeekendHeader ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                >
                  {translate(language, day.dayKey as TranslationKey)}
                </div>
              );
            })}
          </div>

          {/* Days Grid (7 columns) */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/80 dark:divide-slate-800">
            {days.map((day) => {
              const dateStr = day.toDateString();
              const items = events.filter((event) => event.dateKey === dateStr);
              const isToday = dateStr === todayStr;
              const isOutsideMonth = day.getMonth() !== currentMonth;
              const isSunday = day.getDay() === 0;
              const isSaturday = day.getDay() === 6;

              return (
                <div
                  key={dateStr}
                  onClick={() => handleCellClick(day)}
                  className={`group relative flex min-h-[145px] flex-col p-2.5 text-left transition-all hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 cursor-pointer ${
                    isOutsideMonth
                      ? 'calendar-month-day-outside opacity-50'
                      : 'calendar-month-day-current'
                  } ${isToday ? 'bg-indigo-50/25 dark:bg-indigo-950/20' : ''}`}
                >
                  {/* Day cell top bar */}
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black transition-transform group-hover:scale-110 ${
                        isToday
                          ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-300 dark:ring-indigo-400/40'
                          : isOutsideMonth
                          ? 'calendar-month-date-outside font-semibold'
                          : isSunday || isSaturday
                          ? 'text-indigo-600 font-extrabold dark:text-indigo-400'
                          : 'calendar-month-date-current font-extrabold'
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {/* Count badge */}
                    {items.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100/90 px-2 py-0.5 text-[10px] font-black text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:ring-indigo-800">
                        {items.length}
                      </span>
                    )}
                  </div>

                  {/* Events list */}
                  <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
                    {items.slice(0, 3).map((event, index) => {
                      const startTime = event.timeRange ? event.timeRange.split(' – ')[0] : '';
                      const isPastOrDone = event.isPast || event.isCompleted;

                      return (
                        <div
                          key={`${event.id}-${index}`}
                          onClick={(e) => handleEventClick(e, event)}
                          title={`${event.timeRange} • ${event.title}`}
                          className={`group/item flex items-center gap-1.5 rounded-lg border-l-[3.5px] px-2 py-1.5 text-[11px] font-bold shadow-xs transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                            isPastOrDone ? 'opacity-60 saturate-75' : ''
                          }`}
                          style={{
                            backgroundColor: event.bgColor || '#f1f5f9',
                            color: event.textColor || '#0f172a',
                            borderColor: event.color || '#6366f1',
                          }}
                        >
                          {startTime && (
                            <span
                              className="shrink-0 font-black text-[10px] px-1 py-0.2 rounded bg-black/5 dark:bg-white/10"
                              style={{ color: event.color }}
                            >
                              {startTime}
                            </span>
                          )}
                          <span className="truncate leading-tight font-extrabold text-slate-800 dark:text-slate-100">
                            {event.title}
                          </span>
                        </div>
                      );
                    })}

                    {/* +N more button */}
                    {items.length > 3 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePopupDate(day);
                        }}
                        className="mt-auto flex items-center justify-between rounded-lg bg-slate-100/90 px-2 py-1 text-[10px] font-extrabold text-slate-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-indigo-900/60 dark:hover:text-indigo-300"
                      >
                        <span>+{items.length - 3} sự kiện khác</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popup Modal: Hiển thị đầy đủ thông tin ngày khi click vào ô ngày */}
      {activePopupDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActivePopupDate(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black shadow-md shadow-indigo-600/30">
                  <span className="text-[10px] font-semibold uppercase leading-none opacity-80">
                    {activePopupDate.toLocaleDateString(language, { weekday: 'short' })}
                  </span>
                  <span className="text-lg leading-tight">{activePopupDate.getDate()}</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Lịch trình ngày {activePopupDate.getDate()} tháng {activePopupDate.getMonth() + 1}, {activePopupDate.getFullYear()}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {popupEvents.length > 0
                        ? `${popupEvents.length} công việc và sự kiện`
                        : 'Không có lịch trình nào'}
                    </span>
                    {activePopupDate.toDateString() === todayStr && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        Hôm nay
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePopupDate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Events List */}
            <div className="mt-4 flex max-h-[380px] flex-col gap-2.5 overflow-y-auto pr-1">
              {popupEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarDays className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-xs font-bold text-slate-400">Ngày này chưa có lịch trình nào.</p>
                </div>
              ) : (
                popupEvents.map((event) => {
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(e, event)}
                      className="group flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer dark:border-slate-800 dark:bg-slate-800/60"
                      style={{
                        borderLeftWidth: '5px',
                        borderLeftColor: event.color || '#6366f1',
                      }}
                    >
                      {/* Event Row 1: Title, Category Pill & Edit Action */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                            {event.title}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold"
                            style={{
                              backgroundColor: `${event.color}15`,
                              color: event.color,
                            }}
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {event.categoryLabel}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-700/80 dark:text-slate-300 shrink-0">
                          <Edit3 className="h-3 w-3" />
                          <span>Chi tiết</span>
                        </span>
                      </div>

                      {/* Event Row 2: Time, Location, Status */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          {event.timeRange}
                        </span>

                        {event.location && (
                          <span className="flex items-center gap-1 opacity-80">
                            {event.location.includes('Meet') || event.location.includes('Online') ? (
                              <Video className="h-3.5 w-3.5 text-sky-600" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5 text-rose-500" />
                            )}
                            <span className="truncate max-w-[200px]">{event.location}</span>
                          </span>
                        )}

                        {event.isCompleted && (
                          <span className="flex items-center gap-1 font-bold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đã hoàn thành
                          </span>
                        )}

                        {event.isPast && !event.isCompleted && (
                          <span className="flex items-center gap-1 font-medium text-slate-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Đã diễn ra
                          </span>
                        )}
                      </div>

                      {/* Event Description (if any) */}
                      {event.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400 italic">
                          {event.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                Nhấn vào từng sự kiện để chỉnh sửa
              </span>
              <button
                type="button"
                onClick={() => {
                  const target = new Date(activePopupDate);
                  setActivePopupDate(null);
                  onSelectDay(target);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-95 cursor-pointer"
              >
                Mở dòng thời gian ngày
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
