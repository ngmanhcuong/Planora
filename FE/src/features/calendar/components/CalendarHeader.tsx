import React from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { CategoryType } from '@/types';
import { CATEGORY_MAP } from '@/utils/categories';
import type { CalendarViewMode } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';

export interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  activeCategory: CategoryType | 'all';
  onCategoryChange: (category: CategoryType | 'all') => void;
  onOpenCreatePanel: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  activeCategory,
  onCategoryChange,
  onOpenCreatePanel,
}) => {
  const language = useCurrentLanguage();
  const categories: (CategoryType | 'all')[] = [
    'all',
    'study',
    'work',
    'meeting',
    'personal',
    'habit',
  ];

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title & Date Navigation */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#131B2E] tracking-tight font-heading">
              {translate(language, 'calendar.title')}
            </h1>
            <Badge customBg="#D8E2FF" customColor="#001A42" size="sm">
              {translate(language, 'calendar.week')} 38
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8 text-xs bg-[#F8FAFC]">
              {translate(language, 'calendar.today')}
            </Button>
            <div className="flex items-center bg-[#F8FAFC] rounded-lg p-0.5 border border-[#E2E8F0]">
              <button
                className="p-1 rounded-md text-[#64748B] hover:bg-white hover:text-[#131B2E] transition-colors"
                title={translate(language, 'calendar.previousWeek')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded-md text-[#64748B] hover:bg-white hover:text-[#131B2E] transition-colors"
                title={translate(language, 'calendar.nextWeek')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-base font-bold text-[#131B2E] ml-1 font-heading">
              {translate(language, 'calendar.monthYear').replace('{month}', '9').replace('{year}', '2026')}
            </span>
          </div>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex items-center gap-3">
          {/* Segment Tabs */}
          <div className="flex items-center bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0]">
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
                  onClick={() => onViewModeChange(mode)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-[#4F46E5] shadow-xs'
                      : 'text-[#64748B] hover:text-[#131B2E]'
                  }`}
                >
                  {labelMap[mode]}
                </button>
              );
            })}
          </div>

          <Button variant="primary" size="sm" onClick={onOpenCreatePanel}>
            <PlusCircle className="w-4 h-4" />
            <span>{translate(language, 'calendar.newSchedule')}</span>
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 border-t border-[#F1F5F9]">
        <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-bold shrink-0 mr-1">
          {translate(language, 'calendar.filterBy')}:
        </span>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          if (cat === 'all') {
            return (
              <button
                key="all"
                onClick={() => onCategoryChange('all')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#464555] hover:bg-[#EEF2FF]'
                }`}
              >
                {isActive && <Check className="w-3 h-3" />}
                <span>{translate(language, 'tasks.filter.all')}</span>
              </button>
            );
          }
          const info = CATEGORY_MAP[cat];
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#4F46E5] text-white font-semibold shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#131B2E] hover:bg-[#EEF2FF]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
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
