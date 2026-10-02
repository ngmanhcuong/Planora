import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface ApiNote {
  id: string;
  text: string;
  done: boolean;
  tag: string;
  isPinned: boolean;
  color: 'white' | 'amber' | 'sky' | 'emerald' | 'violet' | 'rose';
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  text: string;
  tag: string;
  isPinned: boolean;
  color: ApiNote['color'];
}

export type UpdateNotePayload = Partial<CreateNotePayload & Pick<ApiNote, 'done'>>;

export const notesApi = {
  list: async (): Promise<ApiNote[]> => {
    const response = await apiClient.get<ApiResponse<{ notes: ApiNote[] }>>('/notes');
    return response.data.data.notes;
  },
  create: async (payload: CreateNotePayload): Promise<ApiNote> => {
    const response = await apiClient.post<ApiResponse<{ note: ApiNote }>>('/notes', payload);
    return response.data.data.note;
  },
  update: async (id: string, payload: UpdateNotePayload): Promise<ApiNote> => {
    const response = await apiClient.patch<ApiResponse<{ note: ApiNote }>>(`/notes/${id}`, payload);
    return response.data.data.note;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/${id}`);
  },
};
