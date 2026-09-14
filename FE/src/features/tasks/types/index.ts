import type { CategoryType, PriorityType } from '@/types';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';

export interface TaskItem {
  id: string;
  title: string;
  category: CategoryType;
  categoryLabel: string;
  priority: PriorityType;
  priorityLabel: string;
  dueDate: string;
  dueTime?: string;
  isCompleted: boolean;
  subtasksCount?: {
    total: number;
    completed: number;
  };
  assignee?: string;
  description?: string;
  courseCode?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}
