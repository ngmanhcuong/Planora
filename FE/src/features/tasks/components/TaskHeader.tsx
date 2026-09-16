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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
        {/* Title & Stats Badges */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-200 flex items-center justify-center border border-white/15 backdrop-blur-md shadow-lg shadow-black/10">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                {translate(language, 'tasks.title')}
              </h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/10 text-indigo-100 border border-white/15 backdrop-blur-md">
                {stats.total} {translate(language, 'tasks.total')}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 overflow-x-auto sm:ml-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 text-xs font-bold text-indigo-100 border border-white/15 backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-indigo-200" />
              <span>{translate(language, 'tasks.inProgress')}: {stats.inProgress}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 text-xs font-bold text-indigo-100 border border-white/15 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>{translate(language, 'tasks.completed')}: {stats.completed}</span>
            </div>

            {stats.overdue > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 text-xs font-bold text-rose-100 border border-white/15 backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                <span>{translate(language, 'tasks.overdue')}: {stats.overdue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search & Action Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-indigo-200 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={translate(language, 'tasks.search')}
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder-indigo-200/80 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all font-medium backdrop-blur-md"
            />
          </div>

          <button
            onClick={onOpenPriorityModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold text-indigo-100 hover:bg-white/20 transition-all cursor-pointer backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{translate(language, 'tasks.aiPriority')}</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{translate(language, 'tasks.create')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
