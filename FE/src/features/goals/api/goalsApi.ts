import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface ApiGoal {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  categoryColor: string;
  targetDate: string;
  targetWorkload: number;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  category: string;
  categoryColor?: string;
  targetDate: string;
  targetWorkload?: number;
  isCompleted?: boolean;
}

export type UpdateGoalPayload = CreateGoalPayload;

export const goalsApi = {
  list: async (): Promise<ApiGoal[]> => {
    const response = await apiClient.get<ApiResponse<{ goals: ApiGoal[] }>>('/goals');
    return response.data.data.goals;
  },
  create: async (payload: CreateGoalPayload): Promise<ApiGoal> => {
    const response = await apiClient.post<ApiResponse<{ goal: ApiGoal }>>('/goals', payload);
    return response.data.data.goal;
  },
  update: async (id: string, payload: UpdateGoalPayload): Promise<ApiGoal> => {
    const response = await apiClient.put<ApiResponse<{ goal: ApiGoal }>>(`/goals/${id}`, payload);
    return response.data.data.goal;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/goals/${id}`);
  },
};
