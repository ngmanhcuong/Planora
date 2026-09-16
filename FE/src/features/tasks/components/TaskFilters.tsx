import React from 'react';
import { Filter, Check } from 'lucide-react';
import type { CategoryType, PriorityType } from '@/types';
import { CATEGORY_MAP } from '@/utils/categories';
import type { TaskStatus } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';

export interface TaskFiltersProps {
  activeStatusTab: TaskStatus | 'all';
  onStatusTabChange: (status: TaskStatus | 'all') => void;
  activeCategory: CategoryType | 'all';
  onCategoryChange: (cat: CategoryType | 'all') => void;
  activePriority: PriorityType | 'all';
  onPriorityChange: (prio: PriorityType | 'all') => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  activeStatusTab,
  onStatusTabChange,
  activeCategory,
  onCategoryChange,
  activePriority,
  onPriorityChange,
}) => {
  const language = useCurrentLanguage();

  const tabs: { id: TaskStatus | 'all'; labelKey: TranslationKey }[] = [
    { id: 'all', labelKey: 'tasks.filter.all' },
    { id: 'in_progress', labelKey: 'tasks.filter.inProgress' },
    { id: 'completed', labelKey: 'tasks.filter.completed' },
    { id: 'overdue', labelKey: 'tasks.filter.overdue' },
  ];

  const categories: (CategoryType | 'all')[] = [
    'all',
    'study',
    'work',
    'meeting',
    'personal',
    'deadline',
  ];

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0] overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-[#4F46E5] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#131B2E]'
                }`}
              >
                {translate(language, tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Priority Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-xs font-semibold text-[#64748B]">
            {translate(language, 'tasks.priority.label')}:
          </span>
          <select
            value={activePriority}
            onChange={(e) => onPriorityChange(e.target.value as PriorityType | 'all')}
            className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="all">{translate(language, 'tasks.priority.all')}</option>
            <option value="high">{translate(language, 'tasks.priority.high')}</option>
            <option value="medium">{translate(language, 'tasks.priority.medium')}</option>
            <option value="low">{translate(language, 'tasks.priority.low')}</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#F1F5F9]">
        <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-bold shrink-0 mr-1">
          {translate(language, 'tasks.category.label')}:
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
