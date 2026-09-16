import React from 'react';
import { ProfileCard } from './components/ProfileCard';
import { AcademicSummaryCard } from './components/AcademicSummaryCard';
import { ProfileEditForm } from './components/ProfileEditForm';
import { useProfile, useUpdateProfile } from './hooks/useProfile';
import type { UserProfileData } from './types';
import { Loader2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { data: profileData, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const normalizeProfileField = (value?: string) => {
    const trimmedValue = value?.trim();
    if (!trimmedValue || trimmedValue === 'Chưa cập nhật') return null;
    return trimmedValue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
        <span className="ml-2 text-xs font-semibold text-[#64748B]">Đang tải thông tin hồ sơ...</span>
      </div>
    );
  }

  if (isError || !profileData) {
    return (
      <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
        Đã xảy ra lỗi khi tải hồ sơ cá nhân. Vui lòng thử lại sau.
      </div>
    );
  }

  const profile: UserProfileData = {
    id: profileData.userId,
    name: profileData.name || 'Người dùng Planora',
    email: profileData.email || '',
    avatarUrl: profileData.avatarUrl || '',
    studentId: profileData.studentId || 'Chưa cập nhật',
    major: profileData.major || 'Chưa cập nhật',
    university: profileData.university || 'Trường Đại học Công nghệ',
    joinedDate: '14/09/2026',
    bio: profileData.bio || 'Học hết sức, chơi hết mình! Đang cố gắng nâng cao GPA kỳ này.',
    gpa: profileData.gpa ?? 3.5,
    completedCredits: profileData.completedCredits ?? 85,
    totalCredits: profileData.totalCredits ?? 130,
  };

  const handleSaveProfile = (updated: Partial<UserProfileData>) => {
    updateProfileMutation.mutate({
      name: updated.name?.trim(),
      email: updated.email?.trim(),
      studentId: normalizeProfileField(updated.studentId),
      major: normalizeProfileField(updated.major),
      university: normalizeProfileField(updated.university),
      gpa: updated.gpa,
      completedCredits: updated.completedCredits,
      totalCredits: updated.totalCredits,
      bio: normalizeProfileField(updated.bio),
    });
  };

  return (
    <div className="flex w-full flex-col gap-5 pb-10">
      <ProfileCard profile={profile} />
      <AcademicSummaryCard profile={profile} />
      <ProfileEditForm
        profile={profile}
        onSaveProfile={handleSaveProfile}
        isSaving={updateProfileMutation.isPending}
        saveError={(updateProfileMutation.error as any)?.response?.data?.message || null}
        saveSuccess={updateProfileMutation.isSuccess}
      />
    </div>
  );
};
