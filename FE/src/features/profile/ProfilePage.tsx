import React from 'react';
import { ProfileCard } from './components/ProfileCard';
import { AcademicSummaryCard } from './components/AcademicSummaryCard';
import { ProfileEditForm } from './components/ProfileEditForm';
import { useProfile, useUpdateProfile } from './hooks/useProfile';
import type { UserProfileData } from './types';
import { Loader2 } from 'lucide-react';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { getMultiLangText } from '@/lib/i18n';

export const ProfilePage: React.FC = () => {
  const language = useCurrentLanguage();
  const { data: profileData, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const fallback = {
    notUpdated: getMultiLangText(language, { vi: 'Chưa cập nhật', en: 'Not updated', es: 'Sin actualizar' }),
    user: getMultiLangText(language, { vi: 'Người dùng Planora', en: 'Planora user', es: 'Usuario de Planora' }),
    university: getMultiLangText(language, { vi: 'Trường Đại học Công nghệ', en: 'University of Technology', es: 'Universidad de Tecnología' }),
    bio: getMultiLangText(language, { vi: 'Học hết sức, chơi hết mình! Đang cố gắng nâng cao GPA kỳ này.', en: 'Studying hard and enjoying the journey. Working to improve my GPA this term.', es: 'Estudio con esfuerzo y disfruto el camino. Intento mejorar mi GPA este periodo.' }),
    loading: getMultiLangText(language, { vi: 'Đang tải thông tin hồ sơ...', en: 'Loading profile information...', es: 'Cargando información del perfil...' }),
    error: getMultiLangText(language, { vi: 'Đã xảy ra lỗi khi tải hồ sơ cá nhân. Vui lòng thử lại sau.', en: 'Could not load your profile. Please try again later.', es: 'No se pudo cargar el perfil. Inténtalo de nuevo más tarde.' }),
  };
  const normalizeProfileField = (value?: string) => {
    const trimmedValue = value?.trim();
    if (!trimmedValue || trimmedValue === 'Chưa cập nhật' || trimmedValue === fallback.notUpdated) return null;
    return trimmedValue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
        <span className="ml-2 text-xs font-semibold text-[#64748B]">{fallback.loading}</span>
      </div>
    );
  }

  if (isError || !profileData) {
    return (
      <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
        {fallback.error}
      </div>
    );
  }

  const profile: UserProfileData = {
    id: profileData.userId,
    name: profileData.name || fallback.user,
    email: profileData.email || '',
    avatarUrl: profileData.avatarUrl || '',
    studentId: profileData.studentId || fallback.notUpdated,
    major: profileData.major || fallback.notUpdated,
    university: profileData.university || fallback.university,
    joinedDate: '14/09/2026',
    bio: profileData.bio || fallback.bio,
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
