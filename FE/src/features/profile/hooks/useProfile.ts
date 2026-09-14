import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { UpdateProfilePayload } from '../api/profileApi';
import { useAuthStore } from '@/stores/useAuthStore';

export const profileKeys = {
  profile: ['profile'] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.profile,
    queryFn: () => profileApi.getProfile(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => profileApi.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile });
      if (currentUser) {
        setUser({
          ...currentUser,
          name: updatedProfile.name,
          studentId: updatedProfile.studentId || undefined,
          major: updatedProfile.major || undefined,
          university: updatedProfile.university || undefined,
          avatarUrl: updatedProfile.avatarUrl || undefined,
        });
      }
    },
  });
};
