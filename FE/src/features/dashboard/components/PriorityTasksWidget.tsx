import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, CheckSquare, Plus } from 'lucide-react';
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
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900 font-heading">
            {translate(language, 'dashboard.priorityTasks')}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-xs font-black">
            {pendingCount}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {translate(language, 'dashboard.todayAndOverdue')}
        </span>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2.5">
        {allDisplayTasks.length === 0 ? (
          <div className="py-8 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              {translate(language, 'dashboard.noPriorityTasks')}
            </p>
            <p className="text-[11px] text-slate-500">
              {translate(language, 'dashboard.noPriorityDesc')}
            </p>
            <Link
              to="/tasks"
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{translate(language, 'tasks.create')}</span>
            </Link>
          </div>
        ) : (
          allDisplayTasks.slice(0, 5).map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isOverdue = task.isOverdue || task.displayStatus === 'OVERDUE';

            return (
              <label
                key={task.id}
                className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isCompleted
                    ? 'opacity-60 bg-slate-50 border-slate-200/60'
                    : isOverdue
                    ? 'bg-red-50/40 border-red-200/80 hover:bg-red-50/70'
                    : 'bg-white border-slate-200/70 hover:border-indigo-200 hover:shadow-xs'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleTask(task)}
                  disabled={changeStatusMutation.isPending}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                />
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span
                    className={`text-xs font-extrabold truncate ${
                      isCompleted
                        ? 'line-through text-slate-400'
                        : isOverdue
                        ? 'text-red-700 font-black'
                        : 'text-slate-900 group-hover:text-indigo-600 transition-colors'
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                    {isCompleted ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {translate(language, 'dashboard.done')}
                      </span>
                    ) : isOverdue ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {translate(language, 'dashboard.overdueTasks')}
                      </span>
                    ) : (
                      <>
                        <span className={task.priority === 'HIGH' || task.priority === 'URGENT' ? 'text-rose-600 font-bold' : 'font-medium'}>
                          {task.dueTime || translate(language, 'dashboard.dueToday')}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            task.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}
                        >
                          {task.priority === 'URGENT'
                            ? translate(language, 'dashboard.urgent')
                            : task.priority === 'HIGH'
                            ? translate(language, 'dashboard.high')
                            : task.priority === 'LOW'
                            ? translate(language, 'dashboard.low')
                            : translate(language, 'dashboard.medium')}
                        </span>
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
        className="inline-flex items-center justify-between pt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 group transition-colors border-t border-slate-100"
      >
        <span>{translate(language, 'dashboard.viewAllTasks')}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

