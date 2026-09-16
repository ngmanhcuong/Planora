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
  return <div className="w-full min-w-0 overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/60">
    <div className="min-w-[640px]">
      <div className="grid grid-cols-7 bg-gradient-to-r from-slate-50 via-white to-slate-50 text-center text-xs font-black uppercase tracking-wider text-slate-500">
        {getWeekDays(start).map(day => <div key={day.dayKey} className="p-3.5">{translate(language, day.dayKey as TranslationKey)}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map(day => {
          const items = events.filter(event => event.dateKey === day.toDateString());
          const today = day.toDateString() === new Date().toDateString();
          const isOutsideMonth = day.getMonth() !== currentDate.getMonth();

          return <button type="button" key={day.toDateString()} onClick={() => onSelectDay(day)} aria-label={day.toLocaleDateString(language)} className={`min-h-36 border-t border-r border-slate-200/80 p-3 text-left transition-all hover:bg-indigo-50/50 ${isOutsideMonth ? 'bg-slate-50/70 text-slate-400' : 'text-slate-900'}`}>
            <div className="flex items-center justify-between">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${today ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20' : isOutsideMonth ? 'text-slate-400' : 'bg-slate-100 text-slate-700'}`}>{day.getDate()}</span>
              {items.length > 0 && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-extrabold text-indigo-700">{items.length}</span>}
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {items.slice(0, 3).map((event, index) => <span key={`${event.id}-${index}`} title={`${event.timeRange} ${event.title}`} className="truncate rounded-xl px-2 py-1.5 text-[11px] font-bold ring-1 ring-black/5" style={{ backgroundColor: event.bgColor, color: event.textColor }}>{event.timeRange.split(' – ')[0]} · {event.title}</span>)}
              {items.length > 3 && <span className="text-xs font-bold text-slate-500">+{items.length - 3} lịch khác</span>}
            </div>
          </button>;
        })}
      </div>
    </div>
  </div>;
}
