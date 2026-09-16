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
    <div className="flex flex-col gap-3.5 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {translate(language, tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Priority Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-bold text-slate-600">
            {translate(language, 'tasks.priority.label')}:
          </span>
          <select
            value={activePriority}
            onChange={(e) => onPriorityChange(e.target.value as PriorityType | 'all')}
            className="px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">{translate(language, 'tasks.priority.all')}</option>
            <option value="high">{translate(language, 'tasks.priority.high')}</option>
            <option value="medium">{translate(language, 'tasks.priority.medium')}</option>
            <option value="low">{translate(language, 'tasks.priority.low')}</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-extrabold shrink-0 mr-1">
          {translate(language, 'tasks.category.label')}:
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
