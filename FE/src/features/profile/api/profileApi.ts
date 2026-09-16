import { apiClient } from '@/lib/axios';
import type { ApiProfile, ApiResponse } from '@/types';

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  studentId?: string | null;
  major?: string | null;
  university?: string | null;
  gpa?: number | null;
  completedCredits?: number | null;
  totalCredits?: number | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

export const profileApi = {
  getProfile: async (): Promise<ApiProfile> => {
    const response = await apiClient.get<ApiResponse<{ profile: ApiProfile }>>('/profile');
    return response.data.data.profile;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiProfile> => {
    const response = await apiClient.patch<ApiResponse<{ profile: ApiProfile }>>('/profile', payload);
    return response.data.data.profile;
  },
};
