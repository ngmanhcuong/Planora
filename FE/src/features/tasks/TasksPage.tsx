import React, { useState } from 'react';
import { TaskHeader } from './components/TaskHeader';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskPrioritySuggestion } from '@/features/ai';
import { useTasks, useChangeTaskStatus, useDeleteTask } from './hooks/useTasks';
import type { TaskStatus, TaskStats } from './types';
import type { CategoryType, PriorityType, ApiTask } from '@/types';
import { Loader2 } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [activeStatusTab, setActiveStatusTab] = useState<TaskStatus | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [activePriority, setActivePriority] = useState<PriorityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<ApiTask | null>(null);

  const { data: tasksData, isLoading, isError } = useTasks();
  const changeStatusMutation = useChangeTaskStatus();
  const deleteTaskMutation = useDeleteTask();

  const tasks: ApiTask[] = tasksData?.tasks || [];

  const handleToggleComplete = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    changeStatusMutation.mutate({ id, status: nextStatus });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const handleCloseTaskModal = () => {
    setIsCreateOpen(false);
    setEditingTask(null);
  };

  // Filter tasks logic
  const filteredTasks = tasks.filter((task) => {
    const isCompleted = task.status === 'COMPLETED';
    const isOverdue = task.isOverdue || task.displayStatus === 'OVERDUE';

    // Status tab filter
    if (activeStatusTab === 'in_progress' && (isCompleted || isOverdue)) return false;
    if (activeStatusTab === 'completed' && !isCompleted) return false;
    if (activeStatusTab === 'overdue' && !isOverdue) return false;

    // Category filter
    if (activeCategory !== 'all') {
      const catCode = task.category?.type?.toLowerCase() || '';
      if (catCode !== activeCategory.toLowerCase()) return false;
    }

    // Priority filter
    if (activePriority !== 'all') {
      if (task.priority.toLowerCase() !== activePriority.toLowerCase()) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(q);
      const descMatch = task.description?.toLowerCase().includes(q);
      const codeMatch = task.courseCode?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !codeMatch) return false;
    }

    return true;
  });

  // Calculate statistics from actual task list
  const stats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    inProgress: tasks.filter((t) => t.status !== 'COMPLETED' && !t.isOverdue && t.displayStatus !== 'OVERDUE').length,
    overdue: tasks.filter((t) => t.isOverdue || t.displayStatus === 'OVERDUE').length,
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <TaskHeader
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenPriorityModal={() => setIsPriorityOpen(true)}
      />

      <TaskFilters
        activeStatusTab={activeStatusTab}
        onStatusTabChange={setActiveStatusTab}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
          <span className="ml-2 text-xs font-semibold text-[#64748B]">Đang tải công việc...</span>
        </div>
      ) : isError ? (
        <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
          Đã xảy ra lỗi khi tải danh sách công việc. Vui lòng thử lại sau.
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsCreateOpen(true);
          }}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={handleCloseTaskModal}
        task={editingTask}
      />

      <TaskPrioritySuggestion
        isOpen={isPriorityOpen}
        onClose={() => setIsPriorityOpen(false)}
      />
    </div>
  );
};
