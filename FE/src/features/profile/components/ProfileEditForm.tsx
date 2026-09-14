import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, Mail, GraduationCap, Building2, School, Save, CheckCircle2 } from 'lucide-react';
import { updateProfileSchema, type UpdateProfileInput } from '../validations/profileSchemas';
import type { UserProfileData } from '../types';

export interface ProfileEditFormProps {
  profile: UserProfileData;
  onSaveProfile: (updated: Partial<UserProfileData>) => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  onSaveProfile,
}) => {
  const [showSavedSuccess, setShowSavedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      studentId: profile.studentId,
      major: profile.major,
      university: profile.university,
      bio: profile.bio,
    },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    onSaveProfile(data);
    setShowSavedSuccess(true);
    setTimeout(() => setShowSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
        <div>
          <h3 className="text-base font-bold text-[#131B2E] font-heading">
            Chỉnh sửa thông tin cá nhân
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cập nhật chi tiết hồ sơ hiển thị trên hệ thống Planora.
          </p>
        </div>

        {showSavedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857] animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Đã lưu thành công!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Họ và tên *"
            placeholder="Nhập họ và tên..."
            leftIcon={<User className="w-4 h-4" />}
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Địa chỉ Email *"
            type="email"
            placeholder="name@planora.edu.vn"
            leftIcon={<Mail className="w-4 h-4" />}
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Mã số sinh viên (MSSV)"
            placeholder="VD: 2023601234"
            leftIcon={<GraduationCap className="w-4 h-4" />}
            {...register('studentId')}
            error={errors.studentId?.message}
          />

          <Input
            label="Ngành học"
            placeholder="VD: Công nghệ thông tin"
            leftIcon={<Building2 className="w-4 h-4" />}
            {...register('major')}
            error={errors.major?.message}
          />

          <Input
            label="Trường Đại học"
            placeholder="VD: Trường Đại học Công nghệ"
            leftIcon={<School className="w-4 h-4" />}
            {...register('university')}
            error={errors.university?.message}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#131B2E]">Giới thiệu bản thân (Bio)</label>
          <textarea
            {...register('bio')}
            rows={3}
            placeholder="Mô tả ngắn về sở thích, định hướng học tập..."
            className="w-full p-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#131B2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 resize-none transition-all"
          />
          {errors.bio && <span className="text-xs text-[#BA1A1A] font-medium">{errors.bio.message}</span>}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-[#F1F5F9]">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
