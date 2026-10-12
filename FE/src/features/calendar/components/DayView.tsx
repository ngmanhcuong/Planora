import React, { useMemo } from 'react';
import type { CalendarEventItem } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';
import type { WeekDayItem } from '@/utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Tag,
  Edit3,
  CalendarDays,
  FileText,
} from 'lucide-react';

export interface DayViewProps {
  currentDate: Date;
  weekDays: WeekDayItem[];
  events: CalendarEventItem[];
  onSelectEvent?: (event: CalendarEventItem) => void;
  onSelectDate: (date: Date) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenCreate?: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  weekDays,
  events,
  onSelectEvent,
  onSelectDate,
  onPrevDay,
  onNextDay,
  onOpenCreate,
}) => {
  const language = useCurrentLanguage();
  const dateKey = currentDate.toDateString();
  const isToday = dateKey === new Date().toDateString();

  // Filter and sort events belonging to this specific day
  const dayEvents = useMemo(() => {
    return events
      .filter((e) => e.dateKey === dateKey)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [events, dateKey]);

  const stats = useMemo(() => {
    const completedCount = dayEvents.filter((e) => e.isCompleted).length;
    const pastCount = dayEvents.filter((e) => e.isPast && !e.isCompleted).length;
    const upcomingCount = dayEvents.length - completedCount - pastCount;
    return { completedCount, pastCount, upcomingCount };
  }, [dayEvents]);

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      {/* 1. TOP HEADER: 7-Day Quick Strip & Navigation */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-800/90">
              <button
                type="button"
                onClick={onPrevDay}
                aria-label="Ngày trước"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onSelectDate(new Date())}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={onNextDay}
                aria-label="Ngày sau"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pl-2">
              <CalendarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {currentDate.toLocaleDateString(language, { weekday: 'long' })}, {currentDate.getDate()} tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
              </h2>
              {isToday && (
                <span className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-xs">
                  Hôm nay
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              {dayEvents.length} lịch trình trong ngày
            </span>

            {onOpenCreate && (
              <button
                type="button"
                onClick={onOpenCreate}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Thêm lịch</span>
              </button>
            )}
          </div>
        </div>

        {/* 7-Day Quick Selector Strip */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {weekDays.map((d, index) => {
            const isSelected = d.dateObj.toDateString() === dateKey;
            const isDayToday = d.isToday;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectDate(d.dateObj)}
                className={`group flex min-w-[68px] flex-1 items-center justify-between gap-1.5 rounded-2xl border px-3 py-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-200 dark:ring-indigo-500/30'
                    : 'border-slate-200/80 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex flex-col">
                  <span
                    className={`text-[11px] font-extrabold uppercase ${
                      isSelected
                        ? 'text-indigo-100'
                        : d.isWeekend
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {translate(language, d.dayKey as TranslationKey)}
                  </span>
                  <span
                    className={`text-sm font-black ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {d.dateNum}
                  </span>
                </div>

                {isDayToday && (
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      isSelected ? 'bg-amber-300 ring-2 ring-white/50' : 'bg-indigo-600'
                    }`}
                    title="Hôm nay"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN EVENTS LIST: Chỉ hiển thị các sự kiện đã có trong ngày */}
      <div className="flex flex-col rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Danh sách lịch trình trong ngày ({dayEvents.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhấn vào sự kiện để xem chi tiết hoặc chỉnh sửa thông tin.
            </p>
          </div>

          {/* Quick status counter tags */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Tổng: {dayEvents.length}
            </span>
            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Hoàn thành: {stats.completedCount}
            </span>
            {stats.upcomingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                Sắp tới: {stats.upcomingCount}
              </span>
            )}
          </div>
        </div>

        {/* Event Cards */}
        <div className="mt-4 flex flex-col gap-3">
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <CalendarDays className="h-7 w-7" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                Hôm nay chưa có lịch trình nào
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Bạn chưa thêm công việc, môn học hoặc sự kiện nào vào ngày này.
              </p>
              {onOpenCreate && (
                <button
                  type="button"
                  onClick={onOpenCreate}
                  className="mt-4 flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tạo lịch trình mới</span>
                </button>
              )}
            </div>
          ) : (
            dayEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent?.(evt)}
                className="group relative flex flex-col gap-2 rounded-2xl border-l-[5px] p-4 shadow-xs transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer border border-slate-100 dark:border-slate-800/80"
                style={{
                  backgroundColor: evt.bgColor || '#f8fafc',
                  borderColor: evt.color || '#6366f1',
                }}
              >
                {/* Header: Title + Time pill + Category tag + Edit Action */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                      {evt.title}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-black"
                      style={{ color: evt.color, backgroundColor: 'rgba(255,255,255,0.7)' }}
                    >
                      <Tag className="h-3 w-3" />
                      {evt.categoryLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1 text-xs font-black text-indigo-700 shadow-xs dark:bg-slate-800 dark:text-indigo-300">
                      <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      {evt.timeRange}
                    </span>

                    <span className="flex items-center gap-1 rounded-xl bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-600 shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-slate-800 dark:text-slate-300">
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Sửa</span>
                    </span>
                  </div>
                </div>

                {/* Meta row: Location, Course code, Status */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-black/5 dark:border-white/5">
                  {evt.location && (
                    <span className="flex items-center gap-1">
                      {evt.location.includes('Meet') || evt.location.includes('Online') ? (
                        <Video className="h-3.5 w-3.5 text-sky-600" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      )}
                      <span>{evt.location}</span>
                    </span>
                  )}

                  {evt.courseCode && (
                    <span className="flex items-center gap-1 font-bold text-slate-500">
                      <FileText className="h-3.5 w-3.5" />
                      Mã môn: {evt.courseCode}
                    </span>
                  )}

                  {evt.hasConflict && (
                    <span className="flex items-center gap-1 font-bold text-rose-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Trùng lịch trình
                    </span>
                  )}

                  {evt.isCompleted && (
                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Đã hoàn thành
                    </span>
                  )}

                  {evt.isPast && !evt.isCompleted && (
                    <span className="text-[11px] font-medium text-slate-400">
                      (Đã diễn ra)
                    </span>
                  )}
                </div>

                {/* Description notes if any */}
                {evt.description && (
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 italic">
                    {evt.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
