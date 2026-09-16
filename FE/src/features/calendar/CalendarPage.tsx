import React, { useState } from 'react';
import { CalendarHeader } from './components/CalendarHeader';
import { WeekGrid } from './components/WeekGrid';
import { MonthGrid } from './components/MonthGrid';
import { CreateEventDrawer } from './components/CreateEventDrawer';
import { useCalendarRange, useCreateEvent } from './hooks/useCalendar';
import type { CalendarEventItem, CalendarViewMode } from './types';
import type { CategoryType, ApiCalendarItem } from '@/types';
import { Loader2 } from 'lucide-react';
import { getStartOfWeek, getEndOfWeek, getWeekDays } from '@/utils/dateUtils';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // Compute dynamic week range based on currentDate
  const monday = getStartOfWeek(currentDate);
  const weekDays = getWeekDays(monday).filter(day => viewMode !== 'day' || day.dateObj.toDateString() === currentDate.toDateString());
  const rangeStart = viewMode === 'month' ? getStartOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) : viewMode === 'day' ? new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) : monday;
  const rangeEnd = viewMode === 'month' ? getEndOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)) : viewMode === 'day' ? new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999) : getEndOfWeek(currentDate);

  const rangeParams = {
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
  };

  const { data: calendarData, isLoading, isError } = useCalendarRange(rangeParams);
  const createEventMutation = useCreateEvent();

  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') { d.setDate(1); d.setMonth(d.getMonth() - 1); }
      else d.setDate(d.getDate() - (viewMode === 'day' ? 1 : 7));
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') { d.setDate(1); d.setMonth(d.getMonth() + 1); }
      else d.setDate(d.getDate() + (viewMode === 'day' ? 1 : 7));
      return d;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Convert ApiCalendarItem to CalendarEventItem for WeekGrid
  const rawItems: ApiCalendarItem[] = calendarData || [];

  const convertedEvents: CalendarEventItem[] = rawItems.map((item: ApiCalendarItem, idx: number) => {
    let dayIndex = 0;
    let startTopPx = 448; // default 14:00
    let heightPx = 64; // default 1 hour
    let timeRange = '14:00 – 15:00';

    const itemDateStr = item.start;
    if (itemDateStr) {
      const d = new Date(itemDateStr);
      // Monday = 0 ... Sunday = 6
      const jsDay = d.getDay();
      dayIndex = (jsDay + 6) % 7;

      const hours = d.getHours();
      const mins = d.getMinutes();

      // Top px: 07:00 is 0px. Each hour is 64px.
      const clampedHours = Math.max(7, Math.min(19, hours));
      startTopPx = (clampedHours - 7) * 64 + (mins / 60) * 64;
      timeRange = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    if (item.end && item.start) {
      const startD = new Date(item.start);
      const endD = new Date(item.end);
      const durationHours = (endD.getTime() - startD.getTime()) / (1000 * 60 * 60);
      heightPx = Math.max(32, Math.min(300, Math.round(durationHours * 64)));
      timeRange = `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')} – ${String(endD.getHours()).padStart(2, '0')}:${String(endD.getMinutes()).padStart(2, '0')}`;
    }

    const isTask = item.sourceType === 'TASK';
    const isTimetable = item.sourceType === 'TIMETABLE';
    const catName = item.category?.name || (isTask ? 'Deadline' : isTimetable ? 'Thời khóa biểu' : 'Sự kiện');
    const catBg = item.category?.bgColor || (isTask ? '#FFE4E6' : isTimetable ? '#D8E2FF' : '#EEF2FF');
    const catText = item.category?.textColor || (isTask ? '#991B1B' : isTimetable ? '#001A42' : '#312E81');
    const catColor = item.category?.color || (isTask ? '#E11D48' : isTimetable ? '#0058BE' : '#4F46E5');

    return {
      id: item.id || `evt_${idx}`,
      title: item.title,
      dateKey: new Date(item.start).toDateString(),
      timeRange,
      dayIndex,
      startTopPx,
      heightPx,
      category: (item.category?.type?.toLowerCase() || (isTask ? 'deadline' : 'study')) as CategoryType,
      categoryLabel: catName,
      location: item.location || item.room || undefined,
      color: catColor,
      bgColor: catBg,
      textColor: catText,
    };
  });

  const filteredEvents = convertedEvents.filter((evt) => {
    if (activeCategory === 'all') return true;
    return evt.category === activeCategory;
  });
  const todayKey = new Date().toDateString();
  const todayItemsCount = filteredEvents.filter((evt) => evt.dateKey === todayKey).length;

  return (
    <div className="flex flex-col gap-6 w-full min-h-screen pb-10">
      <CalendarHeader
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onOpenCreatePanel={() => setIsCreateOpen(true)}
        totalItems={filteredEvents.length}
        todayItems={todayItemsCount}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-xs font-bold text-slate-500">Đang tải lịch trình thời gian thực...</span>
        </div>
      ) : isError ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700">
          Đã xảy ra lỗi khi tải lịch trình. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-5 items-start">
          {viewMode === 'month' ? (
            <MonthGrid
              currentDate={currentDate}
              events={filteredEvents}
              onSelectDay={(date) => {
                setCurrentDate(date);
                setViewMode('day');
              }}
            />
          ) : (
            <WeekGrid
              weekDays={weekDays}
              fullWeekDays={getWeekDays(monday)}
              selectedDate={currentDate}
              events={filteredEvents}
              onSelectEvent={() => {
                setIsCreateOpen(true);
              }}
              onSelectDate={(date) => {
                setCurrentDate(date);
              }}
            />
          )}

          {isCreateOpen && (
            <CreateEventDrawer
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              onSave={createEventMutation.mutateAsync} initialDate={currentDate}
              isPending={createEventMutation.isPending}
            />
          )}
        </div>
      )}
    </div>
  );
};
