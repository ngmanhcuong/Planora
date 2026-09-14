import { TaskStatus, TaskPriority } from '@prisma/client';

export interface TaskResponse {
  id: string;
  userId: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    type: string;
    color: string;
    bgColor: string;
    textColor: string;
  } | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  dueTime: string | null;
  courseCode: string | null;
  subtasksCountTotal: number;
  subtasksCountCompleted: number;
  completedAt: Date | null;
  isOverdue: boolean;
  displayStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskListQuery {
  status?: TaskStatus | 'OVERDUE';
  priority?: TaskPriority;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTasksResponse {
  tasks: TaskResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
