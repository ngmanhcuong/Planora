import React, { useState } from 'react';
import { Camera, GraduationCap, Building2, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { UserProfileData } from '../types';

export interface ProfileCardProps {
  profile: UserProfileData;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      {/* Banner / Cover Header */}
      <div className="h-32 bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] relative">
        <div className="absolute right-4 bottom-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Sinh viên Ưu tú</span>
        </div>
      </div>

      {/* Profile Body */}
      <div className="p-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar with Upload button */}
          <div className="relative group shrink-0">
            <img
              src={avatarPreview}
              alt={profile.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-[#4F46E5] text-white shadow-xs cursor-pointer hover:bg-[#4338CA] transition-colors"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* User Basic Info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#131B2E] font-heading">{profile.name}</h2>
              <Badge customBg="#D7E8CD" customColor="#002113" size="sm">
                <CheckCircle2 className="w-3 h-3 text-[#006E4B] mr-1 inline" />
                Đang học
              </Badge>
            </div>

            <p className="text-xs text-[#64748B] font-medium">{profile.email}</p>

            <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap mt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#4F46E5]" />
                MSSV: <strong className="text-[#131B2E] font-mono">{profile.studentId}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#4F46E5]" />
                {profile.major}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" />
                Tham gia: {profile.joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
