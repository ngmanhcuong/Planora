import React from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, Check, Calendar as CalendarIcon } from 'lucide-react';
import type { CategoryType } from '@/types';
import { CATEGORY_MAP } from '@/utils/categories';
import type { CalendarViewMode } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';
import { getWeekNumber, getStartOfWeek } from '@/utils/dateUtils';

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
      const formatted = currentDate.toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      // Capitalize first letter (e.g. "thứ tư..." -> "Thứ Tư...")
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
    <div className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title & Date Navigation */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                {translate(language, 'calendar.title')}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800">
                {formatBadgeText()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:ml-4">
            <button
              onClick={onToday}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {translate(language, 'calendar.today')}
            </button>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                onClick={onPrevWeek}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
                aria-label={`← ${translate(language, `calendar.${viewMode}` as TranslationKey)}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNextWeek}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
                aria-label={`${translate(language, `calendar.${viewMode}` as TranslationKey)} →`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="text-base sm:text-lg font-extrabold text-slate-900 font-heading">
              {formatDateTitle()}
            </span>
          </div>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex items-center gap-3">
          {/* Segment Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labelMap[mode]}
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenCreatePanel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{translate(language, 'calendar.newSchedule')}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-extrabold shrink-0 mr-1">
          {translate(language, 'calendar.filterBy')}:
        </span>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          if (cat === 'all') {
            return (
              <button
                key="all"
                onClick={() => onCategoryChange('all')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
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
  );
};

