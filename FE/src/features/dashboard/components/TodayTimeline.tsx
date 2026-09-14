import React from 'react';
import {
  MapPin,
  User as UserIcon,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ApiTimetableItem, ApiEvent } from '@/types';

export interface TodayTimelineProps {
  timetableToday?: ApiTimetableItem[];
  eventsToday?: ApiEvent[];
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({ timetableToday = [], eventsToday = [] }) => {
  const hasItems = timetableToday.length > 0 || eventsToday.length > 0;
  const totalCount = timetableToday.length + eventsToday.length;

  return (
    <Card padding="lg" className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-[#131B2E] font-heading">Lịch trình hôm nay</h2>
          <Badge customBg="#D8E2FF" customColor="#001A42" size="sm">
            {totalCount} tiết/sự kiện
          </Badge>
        </div>
      </div>

      {!hasItems ? (
        <div className="py-8 text-center text-xs text-[#64748B] flex flex-col items-center gap-2">
          <Calendar className="w-8 h-8 text-slate-300" />
          <span>Hôm nay bạn không có lịch học hoặc sự kiện nào.</span>
        </div>
      ) : (
        /* Timeline List */
        <div className="relative flex flex-col gap-4 pl-3">
          {/* Continuous Vertical Line */}
          <div className="absolute left-[19px] top-3 bottom-6 w-0.5 bg-[#E2E7FF] pointer-events-none" />

          {/* Timetable Items */}
          {timetableToday.map((item) => (
            <div key={`tt_${item.id}`} className="relative flex items-start gap-4 group z-10">
              <div
                className="w-4 h-4 rounded-full shrink-0 mt-2 ring-4 ring-white"
                style={{ backgroundColor: item.color || '#4F46E5' }}
              />

              <div
                className="flex-1 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all flex flex-col gap-2"
                style={{ borderLeftWidth: '3.5px', borderLeftColor: item.color || '#4F46E5' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: item.color || '#4F46E5' }}>
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#C7C4D8]" />
                    <Badge size="sm" customBg="#D8E2FF" customColor="#001A42">
                      Tiết học
                    </Badge>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#131B2E]">
                  {item.subjectName || (item as any).courseName}
                  {item.courseCode ? ` (${item.courseCode})` : ''}
                </h3>

                {(item.room || item.lecturer) && (
                  <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#F2F3FF] text-xs text-[#64748B]">
                    {item.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Phòng {item.room}
                      </span>
                    )}
                    {item.lecturer && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-[#94A3B8]" />
                        GV: {item.lecturer}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Events Today */}
          {eventsToday.map((event) => (
            <div key={`evt_${event.id}`} className="relative flex items-start gap-4 group z-10">
              <div
                className="w-4 h-4 rounded-full shrink-0 mt-2 ring-4 ring-white"
                style={{ backgroundColor: event.color || '#3525CD' }}
              />

              <div
                className="flex-1 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all flex flex-col gap-2"
                style={{ borderLeftWidth: '3.5px', borderLeftColor: event.color || '#3525CD' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: event.color || '#3525CD' }}>
                      {event.allDay ? 'Cả ngày' : `${new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#C7C4D8]" />
                    <Badge size="sm" customBg="#E2DFFF" customColor="#3525CD">
                      Sự kiện
                    </Badge>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#131B2E]">{event.title}</h3>
                {event.description && (
                  <p className="text-xs text-[#464555] leading-relaxed">{event.description}</p>
                )}

                {event.location && (
                  <div className="flex items-center gap-1 pt-1 border-t border-[#F2F3FF] text-xs text-[#64748B]">
                    <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
