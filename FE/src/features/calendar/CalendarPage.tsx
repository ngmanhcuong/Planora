import React, { useState } from 'react';
import { CalendarHeader } from './components/CalendarHeader';
import { WeekGrid } from './components/WeekGrid';
import { CreateEventDrawer } from './components/CreateEventDrawer';
import { useCalendarRange, useCreateEvent } from './hooks/useCalendar';
import type { CalendarEventItem, CalendarViewMode } from './types';
import type { CategoryType, ApiCalendarItem } from '@/types';
import { Loader2 } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // Default to current week range: 2026-09-14 to 2026-09-20
  const rangeParams = {
    start: '2026-09-14T00:00:00.000Z',
    end: '2026-09-20T23:59:59.999Z',
  };

  const { data: calendarData, isLoading, isError } = useCalendarRange(rangeParams);
  const createEventMutation = useCreateEvent();

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

    const catName = item.category?.name || (item.sourceType === 'TASK' ? 'Deadline' : 'Sự kiện');
    const catBg = item.category?.bgColor || (item.sourceType === 'TASK' ? '#FFDAD6' : '#EEF2FF');
    const catText = item.category?.textColor || (item.sourceType === 'TASK' ? '#93000A' : '#3323CC');
    const catColor = item.category?.color || (item.sourceType === 'TASK' ? '#BA1A1A' : '#4F46E5');

    return {
      id: item.id || `evt_${idx}`,
      title: item.title,
      timeRange,
      dayIndex,
      startTopPx,
      heightPx,
      category: (item.category?.name?.toLowerCase() || 'study') as CategoryType,
      categoryLabel: catName,
      location: item.location || undefined,
      color: catColor,
      bgColor: catBg,
      textColor: catText,
    };
  });

  const filteredEvents = convertedEvents.filter((evt) => {
    if (activeCategory === 'all') return true;
    return evt.category === activeCategory;
  });

  const handleSaveNewEvent = (newEventData: any) => {
    createEventMutation.mutate(
      {
        title: newEventData.title,
        startAt: `2026-09-14T${newEventData.startTime || '14:00'}:00.000Z`,
        endAt: `2026-09-14T${newEventData.endTime || '15:00'}:00.000Z`,
        location: newEventData.location || undefined,
        description: newEventData.notes || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full min-h-screen pb-10">
      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onOpenCreatePanel={() => setIsCreateOpen(true)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
          <span className="ml-2 text-xs font-semibold text-[#64748B]">Đang tải lịch trình...</span>
        </div>
      ) : isError ? (
        <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
          Đã xảy ra lỗi khi tải lịch trình. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-5 items-start">
          <WeekGrid
            events={filteredEvents}
            onSelectEvent={() => {
              setIsCreateOpen(true);
            }}
          />

          {isCreateOpen && (
            <CreateEventDrawer
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              onSave={handleSaveNewEvent}
              isPending={createEventMutation.isPending}
            />
          )}
        </div>
      )}
    </div>
  );
};


