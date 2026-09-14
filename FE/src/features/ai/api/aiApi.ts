import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type {
  AiStatus,
  TaskPrioritizationResponse,
  ScheduleRequest,
  ScheduleResponse,
  ApplyScheduleSession,
  AssistantResponse,
} from '../types';

export const aiApi = {
  getStatus: async (): Promise<AiStatus> => {
    const response = await apiClient.get<ApiResponse<AiStatus>>('/ai/status');
    return response.data.data;
  },

  prioritizeTasks: async (taskIds?: string[]): Promise<TaskPrioritizationResponse> => {
    const response = await apiClient.post<ApiResponse<TaskPrioritizationResponse>>('/ai/prioritize-tasks', { taskIds });
    return response.data.data;
  },

  generateSchedule: async (payload: ScheduleRequest): Promise<ScheduleResponse> => {
    const response = await apiClient.post<ApiResponse<ScheduleResponse>>('/ai/schedule', payload);
    return response.data.data;
  },

  applySchedule: async (sessions: ApplyScheduleSession[]): Promise<{ appliedCount: number }> => {
    const response = await apiClient.post<ApiResponse<{ appliedCount: number }>>('/ai/schedule/apply', { sessions });
    return response.data.data;
  },

  askAssistant: async (message: string): Promise<AssistantResponse> => {
    const response = await apiClient.post<ApiResponse<AssistantResponse>>('/ai/assistant', { message });
    return response.data.data;
  },
};
