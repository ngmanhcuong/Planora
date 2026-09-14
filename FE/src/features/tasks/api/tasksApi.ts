import { apiClient } from '@/lib/axios';
import type { ApiTask, ApiResponse } from '@/types';

export interface TaskQueryParams {
  status?: string;
  priority?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  categoryId?: string | null;
  dueDate: string;
  dueTime?: string | null;
  courseCode?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  categoryId?: string | null;
  dueDate?: string;
  dueTime?: string | null;
  courseCode?: string | null;
}

export const tasksApi = {
  getTasks: async (params?: TaskQueryParams): Promise<{ tasks: ApiTask[]; pagination: any }> => {
    const response = await apiClient.get<ApiResponse<{ tasks: ApiTask[]; pagination: any }>>('/tasks', { params });
    return response.data.data;
  },

  getTaskById: async (id: string): Promise<ApiTask> => {
    const response = await apiClient.get<ApiResponse<{ task: ApiTask }>>(`/tasks/${id}`);
    return response.data.data.task;
  },

  createTask: async (payload: CreateTaskPayload): Promise<ApiTask> => {
    const response = await apiClient.post<ApiResponse<{ task: ApiTask }>>('/tasks', payload);
    return response.data.data.task;
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<ApiTask> => {
    const response = await apiClient.patch<ApiResponse<{ task: ApiTask }>>(`/tasks/${id}`, payload);
    return response.data.data.task;
  },

  changeTaskStatus: async (id: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'): Promise<ApiTask> => {
    const response = await apiClient.patch<ApiResponse<{ task: ApiTask }>>(`/tasks/${id}/status`, { status });
    return response.data.data.task;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
