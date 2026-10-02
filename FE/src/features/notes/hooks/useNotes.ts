import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi, type CreateNotePayload, type UpdateNotePayload } from '../api/notesApi';

const noteKeys = { all: ['notes'] as const };

export const useNotes = () => useQuery({ queryKey: noteKeys.all, queryFn: notesApi.list });

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotePayload) => notesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNotePayload }) => notesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
};
