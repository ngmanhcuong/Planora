import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ApiTask } from '@/types';
import { useChangeTaskStatus } from '@/features/tasks/hooks/useTasks';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface PriorityTasksWidgetProps {
  tasks?: ApiTask[];
  overdueTasks?: ApiTask[];
}

export const PriorityTasksWidget: React.FC<PriorityTasksWidgetProps> = ({ tasks = [], overdueTasks = [] }) => {
  const language = useCurrentLanguage();
  const changeStatusMutation = useChangeTaskStatus();

  const allDisplayTasks = [...overdueTasks, ...tasks];
  const pendingCount = allDisplayTasks.filter((t) => t.status !== 'COMPLETED').length;

  const toggleTask = (task: ApiTask) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    changeStatusMutation.mutate({ id: task.id, status: nextStatus });
  };

  return (
    <Card padding="lg" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[#131B2E] font-heading">{translate(language, 'dashboard.priorityTasks')}</h2>
          <span className="w-5 h-5 rounded-full bg-[#E2E7FF] text-[#131B2E] flex items-center justify-center text-xs font-bold">
            {pendingCount}
          </span>
        </div>
        <span className="text-xs text-[#64748B]">{translate(language, 'dashboard.todayAndOverdue')}</span>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {allDisplayTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#64748B]">
            {translate(language, 'dashboard.noPriorityTasks')}
          </div>
        ) : (
          allDisplayTasks.slice(0, 6).map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isOverdue = task.isOverdue || task.displayStatus === 'OVERDUE';

            return (
              <label
                key={task.id}
                className={`group flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${
                  isCompleted ? 'opacity-60 bg-[#F8FAFC]' : isOverdue ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleTask(task)}
                  disabled={changeStatusMutation.isPending}
                  className="mt-1 w-4 h-4 rounded text-[#4F46E5] focus:ring-0 cursor-pointer"
                />
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span
                    className={`text-xs font-bold truncate ${
                      isCompleted
                        ? 'line-through text-[#64748B]'
                        : isOverdue
                        ? 'text-red-700 font-bold'
                        : 'text-[#131B2E] group-hover:text-[#4F46E5] transition-colors'
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                    {isCompleted ? (
                      <span className="text-[#10B981] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {translate(language, 'dashboard.done')}
                      </span>
                    ) : isOverdue ? (
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {translate(language, 'dashboard.overdueTasks')}
                      </span>
                    ) : (
                      <>
                        <span className={task.priority === 'HIGH' || task.priority === 'URGENT' ? 'text-[#F43F5E] font-semibold' : ''}>
                          {task.dueTime || translate(language, 'dashboard.dueToday')}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                        <Badge
                          size="sm"
                          customBg={task.priority === 'HIGH' || task.priority === 'URGENT' ? '#FFDAD6' : '#D8E2FF'}
                          customColor={task.priority === 'HIGH' || task.priority === 'URGENT' ? '#BA1A1A' : '#001A42'}
                        >
                          {task.priority === 'URGENT' ? translate(language, 'dashboard.urgent') : task.priority === 'HIGH' ? translate(language, 'dashboard.high') : task.priority === 'LOW' ? translate(language, 'dashboard.low') : translate(language, 'dashboard.medium')}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>

      {/* Link to Tasks */}
      <Link
        to="/tasks"
        className="inline-flex items-center justify-between pt-2 text-xs font-bold text-[#4F46E5] hover:text-[#3525CD] group transition-colors border-t border-[#E2E8F0]"
      >
        <span>{translate(language, 'dashboard.viewAllTasks')}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </Card>
  );
};
