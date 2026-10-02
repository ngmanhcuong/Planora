import React, { useEffect, useRef, useState } from 'react';
import { CalendarHeader } from './components/CalendarHeader';
import { WeekGrid } from './components/WeekGrid';
import { MonthGrid } from './components/MonthGrid';
import { CreateEventDrawer } from './components/CreateEventDrawer';
import { CalendarItemEditorModal } from './components/CalendarItemEditorModal';
import { useCalendarRange, useCreateEvent, useUpdateEvent } from './hooks/useCalendar';
import type { CalendarEventItem, CalendarViewMode } from './types';
import type { CategoryType, ApiCalendarItem } from '@/types';
import { Loader2 } from 'lucide-react';
import { getStartOfWeek, getEndOfWeek, getWeekDays } from '@/utils/dateUtils';
import { useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useDeleteTimetableItem } from '@/features/timetable/hooks/useTimetable';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventItem | null>(null);

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
  const updateEventMutation = useUpdateEvent();
  const updateTaskMutation = useUpdateTask();
  const deleteTimetableItemMutation = useDeleteTimetableItem();
  const convertingTimetableItemsRef = useRef<Set<string>>(new Set());
  const pendingFocusEventIdRef = useRef<string | null>(null);

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
  const currentTime = new Date().getTime();

  const convertedEvents: CalendarEventItem[] = rawItems.map((item: ApiCalendarItem, idx: number) => {
    const normalizedSourceType = String(item.sourceType || 'EVENT').toUpperCase() as CalendarEventItem['sourceType'];
    let dayIndex = 0;
    let startTopPx = 560; // default 14:00
    let heightPx = 44; // compact default for items without an end time
    let timeRange = '14:00 – 15:00';

    const itemDateStr = item.start;
    if (itemDateStr) {
      const d = new Date(itemDateStr);
      // Monday = 0 ... Sunday = 6
      const jsDay = d.getDay();
      dayIndex = (jsDay + 6) % 7;

      const hours = d.getHours();
      const mins = d.getMinutes();

      // Top px: 07:00 is 0px. Each hour is 80px.
      const clampedHours = Math.max(7, Math.min(19, hours));
      startTopPx = (clampedHours - 7) * 80 + (mins / 60) * 80;
      timeRange = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    if (item.end && item.start) {
      const startD = new Date(item.start);
      const endD = new Date(item.end);
      const durationHours = (endD.getTime() - startD.getTime()) / (1000 * 60 * 60);
      heightPx = Math.max(56, Math.min(360, Math.round(durationHours * 80) - 18));
      timeRange = `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')} – ${String(endD.getHours()).padStart(2, '0')}:${String(endD.getMinutes()).padStart(2, '0')}`;
    }

    const isTask = normalizedSourceType === 'TASK';
    const isTimetable = normalizedSourceType === 'TIMETABLE';
    const catName = item.category?.name || (isTask ? 'Deadline' : isTimetable ? 'Thời khóa biểu' : 'Sự kiện');
    const catBg = item.category?.bgColor || (isTask ? '#FFF7ED' : isTimetable ? '#ECFDF5' : '#EFF6FF');
    const catText = item.category?.textColor || (isTask ? '#9A3412' : isTimetable ? '#065F46' : '#1E3A8A');
    const catColor = item.category?.color || (isTask ? '#F97316' : isTimetable ? '#10B981' : '#2563EB');
    const itemStartTime = new Date(item.start).getTime();
    const itemEndTime = item.end ? new Date(item.end).getTime() : itemStartTime;
    const isCompleted = isTask && item.status === 'COMPLETED';
    const isPast = (Number.isFinite(itemEndTime) ? itemEndTime : itemStartTime) < currentTime;

    return {
      id: item.id || `evt_${idx}`,
      sourceType: normalizedSourceType,
      title: item.title,
      dateKey: new Date(item.start).toDateString(),
      timeRange,
      dayIndex,
      startTopPx,
      heightPx,
      startAt: item.start,
      endAt: item.end,
      category: (item.category?.type?.toLowerCase() || (isTask ? 'deadline' : 'study')) as CategoryType,
      categoryId: item.category?.id || null,
      categoryLabel: catName,
      location: item.location || item.room || undefined,
      description: item.description || undefined,
      priority: item.priority || undefined,
      status: item.status || undefined,
      courseCode: item.courseCode || undefined,
      timetableId: item.timetableId || undefined,
      timetableItemId: item.timetableItemId || undefined,
      isPast,
      isCompleted,
      dragLocked: isPast || isCompleted,
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

  useEffect(() => {
    const eventId = pendingFocusEventIdRef.current;
    if (!eventId || !convertedEvents.some((event) => event.id === eventId)) return;

    pendingFocusEventIdRef.current = null;
    window.requestAnimationFrame(() => {
      const card = Array.from(document.querySelectorAll<HTMLElement>('[data-calendar-event-id]'))
        .find((element) => element.dataset.calendarEventId === eventId);
      card?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    });
  }, [convertedEvents]);

  const handleCreateEvent = async (data: Parameters<typeof createEventMutation.mutateAsync>[0]) => {
    const event = await createEventMutation.mutateAsync(data);
    pendingFocusEventIdRef.current = event.id;
    setCurrentDate(new Date(event.startAt));
    setActiveCategory('all');
    setViewMode('day');
    return event;
  };

  const getEventMutationId = (id: string) => {
    return id.includes('_rec_') ? id.split('_rec_')[0] : id;
  };

  const getTimetableItemId = (eventItem: CalendarEventItem) => {
    if (eventItem.timetableItemId) return eventItem.timetableItemId;
    const match = eventItem.id.match(/^tt_(.+)_\d{4}-\d{2}-\d{2}$/);
    return match?.[1];
  };

  const convertTimetableItemToEvent = async (eventItem: CalendarEventItem, data: Parameters<typeof createEventMutation.mutateAsync>[0]) => {
    const timetableId = eventItem.timetableId;
    const itemId = getTimetableItemId(eventItem);
    if (!timetableId || !itemId || convertingTimetableItemsRef.current.has(itemId)) return;

    convertingTimetableItemsRef.current.add(itemId);
    try {
      await createEventMutation.mutateAsync(data);
      await deleteTimetableItemMutation.mutateAsync({ timetableId, itemId });
    } finally {
      convertingTimetableItemsRef.current.delete(itemId);
    }
  };

  const handleMoveCalendarItem = (eventItem: CalendarEventItem, targetDate: Date) => {
    if (eventItem.dragLocked || eventItem.isPast || eventItem.isCompleted) return;
    const currentStart = new Date(eventItem.startAt);
    const nextStart = new Date(targetDate);
    if (currentStart.getTime() === nextStart.getTime()) return;

    const currentEnd = eventItem.endAt ? new Date(eventItem.endAt) : new Date(currentStart.getTime() + 60 * 60 * 1000);
    const durationMs = Math.max(15 * 60 * 1000, currentEnd.getTime() - currentStart.getTime());
    const nextEnd = new Date(nextStart.getTime() + durationMs);

    if (eventItem.sourceType === 'EVENT') {
      updateEventMutation.mutate({
        id: getEventMutationId(eventItem.id),
        data: {
          startAt: nextStart.toISOString(),
          endAt: nextEnd.toISOString(),
        },
      });
      return;
    }

    if (eventItem.sourceType === 'TIMETABLE') {
      void convertTimetableItemToEvent(eventItem, {
        title: eventItem.title,
        location: eventItem.location,
        startAt: nextStart.toISOString(),
        endAt: nextEnd.toISOString(),
        allDay: false,
        color: eventItem.color,
      });
      return;
    }

    if (eventItem.sourceType === 'TASK') {
      updateTaskMutation.mutate({
        id: eventItem.id,
        data: {
          dueDate: nextStart.toISOString(),
          dueTime: `${String(nextStart.getHours()).padStart(2, '0')}:${String(nextStart.getMinutes()).padStart(2, '0')}`,
        },
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
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
              onSelectEvent={(event) => {
                setEditingEvent(event);
              }}
              onSelectDate={(date) => {
                setCurrentDate(date);
              }}
              onPrevRange={handlePrevWeek}
              onNextRange={handleNextWeek}
              onMoveEvent={handleMoveCalendarItem}
            />
          )}

          {isCreateOpen && (
            <CreateEventDrawer
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              onSave={handleCreateEvent} initialDate={currentDate}
              isPending={createEventMutation.isPending}
            />
          )}

          <CalendarItemEditorModal
            event={editingEvent}
            isOpen={Boolean(editingEvent)}
            onClose={() => setEditingEvent(null)}
            isPending={updateEventMutation.isPending || updateTaskMutation.isPending || createEventMutation.isPending || deleteTimetableItemMutation.isPending}
            onSaveEvent={(event, data) => updateEventMutation.mutateAsync({ id: getEventMutationId(event.id), data })}
            onSaveTask={(event, data) => updateTaskMutation.mutateAsync({ id: event.id, data })}
            onSaveTimetable={convertTimetableItemToEvent}
          />
        </div>
      )}
    </div>
  );
};

