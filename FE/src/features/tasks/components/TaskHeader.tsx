import React from 'react';
import { PlusCircle, CheckCircle2, Clock, AlertTriangle, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title & Stats Badges */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#131B2E] tracking-tight font-heading">
              {translate(language, 'tasks.title')}
            </h1>
            <Badge customBg="#D8E2FF" customColor="#001A42" size="md">
              {stats.total} {translate(language, 'tasks.total')}
            </Badge>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
              <Clock className="w-3.5 h-3.5 text-[#0058BE]" />
              <span>{translate(language, 'tasks.inProgress')}: {stats.inProgress}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{translate(language, 'tasks.completed')}: {stats.completed}</span>
            </div>

            {stats.overdue > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-semibold text-[#E11D48]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F43F5E]" />
                <span>{translate(language, 'tasks.overdue')}: {stats.overdue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search & Action Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={translate(language, 'tasks.search')}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#131B2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={onOpenPriorityModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2FF] border border-[#E2DFFF] text-xs font-bold text-[#4F46E5] hover:bg-[#E2DFFF] transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{translate(language, 'tasks.aiPriority')}</span>
          </button>

          <Button variant="primary" size="sm" onClick={onOpenCreateModal}>
            <PlusCircle className="w-4 h-4" />
            <span>{translate(language, 'tasks.create')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
