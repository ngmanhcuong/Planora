import type { CalendarEventItem } from '../types';
import { getStartOfWeek, getEndOfWeek, getWeekDays } from '@/utils/dateUtils';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';

export function MonthGrid({ currentDate, events, onSelectDay }: {
  currentDate: Date;
  events: CalendarEventItem[];
  onSelectDay: (date: Date) => void;
}) {
  const language = useCurrentLanguage();
  const start = getStartOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const end = getEndOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
  const days: Date[] = [];
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) days.push(new Date(day));
  return <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
    <div className="min-w-[640px]">
      <div className="grid grid-cols-7 bg-[#F8FAFC] text-center text-xs font-semibold text-[#64748B]">
        {getWeekDays(start).map(day => <div key={day.dayKey} className="p-3">{translate(language, day.dayKey as TranslationKey)}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map(day => {
          const items = events.filter(event => event.dateKey === day.toDateString());
          const today = day.toDateString() === new Date().toDateString();
          return <button type="button" key={day.toDateString()} onClick={() => onSelectDay(day)} aria-label={day.toLocaleDateString(language)} className={`min-h-32 border-t border-r border-[#E2E8F0] p-2 text-left hover:bg-[#F8FAFC] ${day.getMonth() !== currentDate.getMonth() ? 'bg-[#F8FAFC] text-[#64748B]' : 'text-[#131B2E]'}`}>
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${today ? 'bg-[#4F46E5] text-white' : ''}`}>{day.getDate()}</span>
            <div className="mt-1 flex flex-col gap-1">
              {items.slice(0, 3).map((event, index) => <span key={`${event.id}-${index}`} title={`${event.timeRange} ${event.title}`} className="truncate rounded px-1.5 py-1 text-[11px] bg-[#EEF2FF] text-[#4F46E5]">{event.timeRange.split(' – ')[0]} · {event.title}</span>)}
              {items.length > 3 && <span className="text-xs text-[#64748B]">+{items.length - 3}</span>}
            </div>
          </button>;
        })}
      </div>
    </div>
  </div>;
}
