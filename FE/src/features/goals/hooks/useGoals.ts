import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsApi, type CreateGoalPayload, type UpdateGoalPayload } from '../api/goalsApi';

const goalKeys = { all: ['goals'] as const };

export const useGoals = () => useQuery({ queryKey: goalKeys.all, queryFn: goalsApi.list });

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => goalsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalKeys.all }),
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGoalPayload }) => goalsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalKeys.all }),
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goalsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalKeys.all }),
  });
};
