import React from 'react';
import { Check, Calendar, CheckSquare, Trash2, BookOpen } from 'lucide-react';
import type { ApiTask } from '@/types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface TaskCardProps {
  task: ApiTask;
  onToggleComplete: (id: string, currentStatus: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDeleteTask,
}) => {
  const language = useCurrentLanguage();
  const isCompleted = task.status === 'COMPLETED';
  const isOverdue = task.isOverdue || task.displayStatus === 'OVERDUE';

  const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
    URGENT: { bg: '#FFE4E6', text: '#991B1B', label: translate(language, 'tasks.card.urgent') },
    HIGH: { bg: '#FEF3C7', text: '#92400E', label: translate(language, 'tasks.card.high') },
    MEDIUM: { bg: '#E0E7FF', text: '#3730A3', label: translate(language, 'tasks.card.medium') },
    LOW: { bg: '#D1FAE5', text: '#065F46', label: translate(language, 'tasks.card.low') },
  };

  const prio = priorityStyles[task.priority] || priorityStyles.MEDIUM;

  const categoryName = task.category?.name || 'Học tập';
  const categoryBg = task.category?.bgColor || '#EEF2FF';
  const categoryText = task.category?.textColor || '#312E81';
  const categoryDot = task.category?.color || '#4F46E5';

  // Format dueDate display
  const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '';

  return (
    <div
      className={`group flex items-start justify-between gap-4 p-4.5 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
          : isOverdue
          ? 'bg-rose-50/40 border-rose-200/80'
          : 'bg-white border-slate-200/80 hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        {/* Custom Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id, task.status)}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            isCompleted
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
              : 'border-slate-300 bg-white hover:border-indigo-600'
          }`}
          aria-label={
            isCompleted
              ? translate(language, 'tasks.card.markIncomplete')
              : translate(language, 'tasks.card.markComplete')
          }
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Pill */}
            <span
              className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5"
              style={{ backgroundColor: categoryBg, color: categoryText }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryDot }} />
              {categoryName}
            </span>

            {/* Priority Badge */}
            <span
              className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: prio.bg, color: prio.text }}
            >
              {prio.label}
            </span>

            {/* Course Code if present */}
            {task.courseCode && (
              <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                <BookOpen className="w-3 h-3 text-indigo-600" />
                {task.courseCode}
              </span>
            )}
          </div>

          <h3
            className={`text-sm font-extrabold text-slate-900 leading-snug ${
              isCompleted ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          {/* Meta footer: Due date & subtasks */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-medium text-slate-500">
            <span
              className={`flex items-center gap-1.5 font-bold ${
                isOverdue ? 'text-rose-600' : 'text-slate-600'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{translate(language, 'tasks.card.due')}: {dueDateStr}</span>
              {task.dueTime && <span>({task.dueTime})</span>}
              {isOverdue && (
                <span className="font-extrabold ml-1 text-rose-600">
                  ({translate(language, 'tasks.overdue')})
                </span>
              )}
            </span>

            {task.subtasksCountTotal ? (
              <span className="flex items-center gap-1.5 font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {task.subtasksCountCompleted || 0}/{task.subtasksCountTotal}{' '}
                  {translate(language, 'tasks.card.subtasks')}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <button
        onClick={() => onDeleteTask(task.id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all shrink-0 cursor-pointer"
        title={translate(language, 'tasks.card.delete')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

