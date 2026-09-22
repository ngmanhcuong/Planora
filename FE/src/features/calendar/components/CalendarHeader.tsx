import React from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, Check, Calendar as CalendarIcon } from 'lucide-react';
import type { CategoryType } from '@/types';
import { CATEGORY_MAP } from '@/utils/categories';
import type { CalendarViewMode } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, getMultiLangText, type TranslationKey } from '@/lib/i18n';
import { getWeekNumber, getStartOfWeek } from '@/utils/dateUtils';
import { UserHeroBanner } from '@/components/ui/UserHeroBanner';

const LOCALE_MAP: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
};

export interface CalendarHeaderProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  activeCategory: CategoryType | 'all';
  onCategoryChange: (category: CategoryType | 'all') => void;
  onOpenCreatePanel: () => void;
  totalItems?: number;
  todayItems?: number;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  viewMode,
  onViewModeChange,
  activeCategory,
  onCategoryChange,
  onOpenCreatePanel,
}) => {
  const language = useCurrentLanguage();
  const weekNum = getWeekNumber(currentDate);
  const monday = getStartOfWeek(currentDate);

  // Format date header text dynamically based on viewMode
  const formatDateTitle = () => {
    if (viewMode === 'day') {
      const locale = LOCALE_MAP[language || 'vi'] || 'en-US';
      const formatted = currentDate.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    const displayDate = viewMode === 'week' ? monday : currentDate;
    const m = displayDate.getMonth() + 1;
    const y = displayDate.getFullYear();
    return translate(language, 'calendar.monthYear')
      .replace('{month}', String(m))
      .replace('{year}', String(y));
  };

  const formatBadgeText = () => {
    if (viewMode === 'day') {
      return `${translate(language, 'calendar.day')} ${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
    }
    if (viewMode === 'month') {
      return `${translate(language, 'calendar.month')} ${currentDate.getMonth() + 1}`;
    }
    return `${translate(language, 'calendar.week')} ${weekNum}`;
  };

  const categories: (CategoryType | 'all')[] = [
    'all',
    'study',
    'work',
    'meeting',
    'personal',
    'habit',
  ];

  return (
    <div className="flex flex-col gap-4">
      <UserHeroBanner
        tone="calendar"
        icon={CalendarIcon}
        iconClassName="text-cyan-100"
        badge={formatBadgeText()}
        badges={(
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
            {formatDateTitle()}
          </span>
        )}
        title={translate(language, 'calendar.title')}
        subtitle={getMultiLangText(language, {
          vi: 'Quản lý lịch học, deadline và sự kiện trong một không gian đồng bộ.',
          en: 'Manage classes, deadlines, and events in one synchronized workspace.',
          ja: '授業、締切、イベントを一元管理。',
          ko: '수업, 마감일, 이벤트를 하나의 동기화된 공간에서 관리하세요.',
          zh: '在一个同步的空间中管理课程、截止日期和事件。',
          fr: 'Gérez cours, échéances et événements dans un espace synchronisé.',
          de: 'Verwalten Sie Kurse, Fristen und Termine an einem Ort.',
          es: 'Gestiona clases, fechas límite y eventos en un espacio sincronizado.',
        })}
        actions={(
          <>
            {/* Today & Arrow Nav */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
              <button
                onClick={onToday}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                {translate(language, 'calendar.today')}
              </button>
              <div className="h-4 w-px bg-white/20 mx-0.5" />
              <button
                onClick={onPrevWeek}
                className="p-1.5 rounded-xl text-indigo-100 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                title={getMultiLangText(language, { vi: 'Trước', en: 'Previous', ja: '前へ', ko: '이전', zh: '上一页', fr: 'Précédent', de: 'Zurück', es: 'Anterior' })}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNextWeek}
                className="p-1.5 rounded-xl text-indigo-100 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                title={getMultiLangText(language, { vi: 'Sau', en: 'Next', ja: '次へ', ko: '다음', zh: '下一页', fr: 'Suivant', de: 'Weiter', es: 'Siguiente' })}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
              {(['day', 'week', 'month'] as CalendarViewMode[]).map((mode) => {
                const labelMap: Record<CalendarViewMode, string> = {
                  day: translate(language, 'calendar.day'),
                  week: translate(language, 'calendar.week'),
                  month: translate(language, 'calendar.month'),
                };
                const isActive = viewMode === mode;
                return (
                  <button
                    key={mode}
                    aria-pressed={isActive}
                    onClick={() => onViewModeChange(mode)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-md shadow-black/10'
                        : 'text-indigo-100 hover:text-white'
                    }`}
                  >
                    {labelMap[mode]}
                  </button>
                );
              })}
            </div>

            {/* Create Button */}
            <button
              onClick={onOpenCreatePanel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{translate(language, 'calendar.newSchedule')}</span>
            </button>
          </>
        )}
      />

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="shrink-0 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {translate(language, 'calendar.filterBy')}:
            </span>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              if (cat === 'all') {
                return (
                  <button
                    key="all"
                    onClick={() => onCategoryChange('all')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5" />}
                    <span>{translate(language, 'tasks.filter.all')}</span>
                  </button>
                );
              }
              const info = CATEGORY_MAP[cat];
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: info.color }}
                  />
                  <span>{translate(language, `category.${cat}` as TranslationKey) || info.label}</span>
                </button>
              );
            })}
          </div>
      </div>
    </div>
  );
};
