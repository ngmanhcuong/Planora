import React from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, Check, Calendar as CalendarIcon } from 'lucide-react';
import type { CategoryType } from '@/types';
import { CATEGORY_MAP } from '@/utils/categories';
import type { CalendarViewMode } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, getMultiLangText, type TranslationKey } from '@/lib/i18n';
import { getWeekNumber, getStartOfWeek } from '@/utils/dateUtils';

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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white border border-indigo-800/40 p-5 sm:p-6 shadow-xl shadow-indigo-950/20">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Top Row: Page Title & Main Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-200 flex items-center justify-center border border-white/15 backdrop-blur-md shadow-lg shadow-black/10 shrink-0">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
                {translate(language, 'calendar.title')}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-indigo-100/90 mt-0.5">
                {getMultiLangText(language, {
                  vi: 'Quản lý lịch học, deadline và sự kiện trong một không gian đồng bộ.',
                  en: 'Manage classes, deadlines, and events in one synchronized workspace.',
                  ja: '授業、締切、イベントを一元管理。',
                  ko: '수업, 마감일, 이벤트를 하나의 동기화된 공간에서 관리하세요.',
                  zh: '在一个同步的空间中管理课程、截止日期和事件。',
                  fr: 'Gérez cours, échéances et événements dans un espace synchronisé.',
                  de: 'Verwalten Sie Kurse, Fristen und Termine an einem Ort.',
                  es: 'Gestiona clases, fechas límite y eventos en un espacio sincronizado.',
                })}
              </p>
            </div>
          </div>

          {/* Action Controls Group */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
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
          </div>
        </div>

        {/* Bottom Row: Active Date Banner & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/10">
          {/* Active Date Title */}
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-xl font-black text-white tracking-tight font-heading">
              {formatDateTitle()}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/10 text-indigo-200 border border-white/15 backdrop-blur-md">
              {formatBadgeText()}
            </span>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] text-indigo-200 uppercase tracking-wider font-extrabold shrink-0 mr-1">
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
                        ? 'bg-white text-indigo-700 shadow-md shadow-black/10'
                        : 'bg-white/10 text-indigo-100 hover:bg-white/20 border border-white/10'
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
                      ? 'bg-white text-indigo-700 shadow-md shadow-black/10'
                      : 'bg-white/10 text-indigo-100 hover:bg-white/20 border border-white/10'
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
    </div>
  );
};
