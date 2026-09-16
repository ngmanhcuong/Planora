import React from 'react';
import { PlusCircle, CheckCircle2, Clock, AlertTriangle, Search, Sparkles, CheckSquare } from 'lucide-react';
import type { TaskStats } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface TaskHeaderProps {
  stats: TaskStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenPriorityModal?: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  stats,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenPriorityModal,
}) => {
  const language = useCurrentLanguage();

  return (
    <div className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title & Stats Badges */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                {translate(language, 'tasks.title')}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
                {stats.total} {translate(language, 'tasks.total')}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 overflow-x-auto sm:ml-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{translate(language, 'tasks.inProgress')}: {stats.inProgress}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{translate(language, 'tasks.completed')}: {stats.completed}</span>
            </div>

            {stats.overdue > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-xs font-bold text-rose-700 border border-rose-200/60">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{translate(language, 'tasks.overdue')}: {stats.overdue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search & Action Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={translate(language, 'tasks.search')}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 border border-slate-200/80 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <button
            onClick={onOpenPriorityModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200/60 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{translate(language, 'tasks.aiPriority')}</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{translate(language, 'tasks.create')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

