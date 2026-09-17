import React from 'react';
import { TaskCard } from './TaskCard';
import { Inbox } from 'lucide-react';
import type { ApiTask } from '@/types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface TaskListProps {
  tasks: ApiTask[];
  onToggleComplete: (id: string, currentStatus: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: ApiTask) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}) => {
  const language = useCurrentLanguage();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs text-center">
        <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#131B2E]">
          {translate(language, 'tasks.empty.title')}
        </h3>
        <p className="text-xs text-[#64748B] mt-1 max-w-sm">
          {translate(language, 'tasks.empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
        />
      ))}
    </div>
  );
};
