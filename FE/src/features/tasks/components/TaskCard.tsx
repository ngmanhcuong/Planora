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
    URGENT: { bg: '#FFDAD6', text: '#93000A', label: translate(language, 'tasks.card.urgent') },
    HIGH: { bg: '#FFDAD6', text: '#93000A', label: translate(language, 'tasks.card.high') },
    MEDIUM: { bg: '#E2DFFF', text: '#3323CC', label: translate(language, 'tasks.card.medium') },
    LOW: { bg: '#D7E8CD', text: '#002113', label: translate(language, 'tasks.card.low') },
  };

  const prio = priorityStyles[task.priority] || priorityStyles.MEDIUM;

  const categoryName = task.category?.name || 'Học tập';
  const categoryBg = task.category?.bgColor || '#D8E2FF';
  const categoryText = task.category?.textColor || '#001A42';
  const categoryDot = task.category?.color || '#0058BE';

  // Format dueDate display
  const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '';

  return (
    <div
      className={`group flex items-start justify-between gap-4 p-4 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-[#F8FAFC]/70 border-[#E2E8F0] opacity-75'
          : isOverdue
          ? 'bg-[#FFF1F2]/40 border-[#FFE4E6]'
          : 'bg-white border-[#E2E8F0] hover:shadow-xs hover:border-[#CBD5E1]'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        {/* Custom Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id, task.status)}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            isCompleted
              ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-2xs'
              : 'border-[#CBD5E1] bg-white hover:border-[#4F46E5]'
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
              className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ backgroundColor: categoryBg, color: categoryText }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryDot }} />
              {categoryName}
            </span>

            {/* Priority Badge */}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: prio.bg, color: prio.text }}
            >
              {prio.label}
            </span>

            {/* Course Code if present */}
            {task.courseCode && (
              <span className="text-[10px] font-mono font-semibold text-[#64748B] flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-[#4F46E5]" />
                {task.courseCode}
              </span>
            )}
          </div>

          <h3
            className={`text-sm font-bold text-[#131B2E] leading-snug ${
              isCompleted ? 'line-through text-[#64748B]' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          {/* Meta footer: Due date & subtasks */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-medium text-[#64748B]">
            <span
              className={`flex items-center gap-1 font-semibold ${
                isOverdue ? 'text-[#BA1A1A]' : 'text-[#64748B]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{translate(language, 'tasks.card.due')}: {dueDateStr}</span>
              {task.dueTime && <span>({task.dueTime})</span>}
              {isOverdue && (
                <span className="font-bold ml-1 text-[#BA1A1A]">
                  ({translate(language, 'tasks.overdue')})
                </span>
              )}
            </span>

            {task.subtasksCountTotal ? (
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-[#4F46E5]" />
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
        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#BA1A1A] hover:bg-[#FFF1F2] opacity-0 group-hover:opacity-100 transition-all shrink-0 cursor-pointer"
        title={translate(language, 'tasks.card.delete')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
