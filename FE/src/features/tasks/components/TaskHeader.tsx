import React from 'react';
import { PlusCircle, CheckCircle2, Clock, AlertTriangle, Search, Sparkles, CheckSquare } from 'lucide-react';
import type { TaskStats } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';
import { UserHeroBanner } from '@/components/ui/UserHeroBanner';

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
    <UserHeroBanner
      tone="tasks"
      icon={CheckSquare}
      badge={`${stats.total} ${translate(language, 'tasks.total')}`}
      badges={(
        <>
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-indigo-200" />
              <span>{translate(language, 'tasks.inProgress')}: {stats.inProgress}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>{translate(language, 'tasks.completed')}: {stats.completed}</span>
            </div>

            {stats.overdue > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-rose-100 backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                <span>{translate(language, 'tasks.overdue')}: {stats.overdue}</span>
              </div>
            )}
        </>
      )}
      title={translate(language, 'tasks.title')}
      subtitle={translate(language, 'tasks.search')}
      actions={(
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-56 md:w-64">
            <Search className="w-4 h-4 text-indigo-200 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={translate(language, 'tasks.search')}
              className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder-indigo-200/80 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all font-medium backdrop-blur-md"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              onClick={onOpenPriorityModal}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 text-xs font-bold text-indigo-100 hover:bg-white/20 transition-all cursor-pointer backdrop-blur-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 shrink-0" />
              <span className="truncate">{translate(language, 'tasks.aiPriority')}</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{translate(language, 'tasks.create')}</span>
            </button>
          </div>
        </div>
      )}
    />
  );
};
