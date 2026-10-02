import React from 'react';
import { ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { ApiEvent } from '@/types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, getMultiLangText } from '@/lib/i18n';

export interface TomorrowPreviewWidgetProps {
  events?: ApiEvent[];
}

export const TomorrowPreviewWidget: React.FC<TomorrowPreviewWidgetProps> = ({ events = [] }) => {
  const language = useCurrentLanguage();

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900 font-heading">
            {translate(language, 'dashboard.upcomingEvents')}
          </h2>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
          {translate(language, 'dashboard.next7Days')}
        </span>
      </div>

      {/* Tomorrow / Upcoming Event Cards */}
      <div className="flex flex-col gap-2.5">
        {events.length === 0 ? (
          <div className="py-6 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            {translate(language, 'dashboard.noUpcomingEvents')}
          </div>
        ) : (
          events.slice(0, 4).map((event) => {
            const rawStart = event.startAt || (event as ApiEvent & { start?: string; startTime?: string }).start || (event as ApiEvent & { startTime?: string }).startTime;
            const startDate = rawStart ? new Date(rawStart) : null;
            const hasValidDate = startDate !== null && !Number.isNaN(startDate.getTime());
            const timeStr = event.allDay
              ? translate(language, 'dashboard.allDay')
              : hasValidDate
                ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : getMultiLangText(language, { vi: 'Chưa đặt giờ', en: 'Time not set', ja: '時刻未設定', ko: '시간 미설정', zh: '时间未设置', fr: 'Heure non définie', de: 'Keine Uhrzeit', es: 'Hora no definida' });
            const dayNum = hasValidDate ? startDate.getDate() : '--';
            const monthNum = hasValidDate ? startDate.getMonth() + 1 : null;
            const monthLabel = getMultiLangText(language, {
              vi: monthNum ? `T${monthNum}` : 'NGÀY',
              en: monthNum ? `M${monthNum}` : 'DATE',
              ja: monthNum ? `${monthNum}月` : '日付',
              ko: monthNum ? `${monthNum}월` : '날짜',
              zh: monthNum ? `${monthNum}月` : '日期',
              fr: monthNum ? `M${monthNum}` : 'DATE',
              de: monthNum ? `M${monthNum}` : 'DATUM',
              es: monthNum ? `M${monthNum}` : 'FECHA',
            });

            return (
              <div
                key={event.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Date badge */}
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase leading-none">
                      {monthLabel}
                    </span>
                    <span className="text-xs font-black text-slate-900 leading-none mt-0.5">
                      {dayNum}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {timeStr} {event.location ? `• ${event.location}` : ''}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-600 transition-all shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

