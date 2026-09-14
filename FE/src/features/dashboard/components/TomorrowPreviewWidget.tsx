import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { ApiEvent } from '@/types';

export interface TomorrowPreviewWidgetProps {
  events?: ApiEvent[];
}

export const TomorrowPreviewWidget: React.FC<TomorrowPreviewWidgetProps> = ({ events = [] }) => {
  return (
    <Card padding="lg" className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#131B2E] font-heading">Sự kiện sắp tới</h2>
        <span className="text-xs text-[#64748B] font-medium">7 ngày tới</span>
      </div>

      {/* Tomorrow / Upcoming Event Cards */}
      <div className="flex flex-col gap-2">
        {events.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#64748B]">
            Không có sự kiện sắp tới.
          </div>
        ) : (
          events.slice(0, 4).map((event) => {
            const startDate = new Date(event.startAt);
            const timeStr = event.allDay
              ? 'Cả ngày'
              : `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const dateStr = `${startDate.getDate()}/${startDate.getMonth() + 1}`;

            return (
              <div
                key={event.id}
                className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: event.color || '#4F46E5' }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#131B2E] truncate">{event.title}</span>
                    <span className="text-[11px] text-[#64748B]">
                      {dateStr} • {timeStr} {event.location ? `• ${event.location}` : ''}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
