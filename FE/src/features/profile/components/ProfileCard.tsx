import React, { useState } from 'react';
import { Award, Building2, Calendar, Camera, CheckCircle2, GraduationCap, Mail } from 'lucide-react';
import type { UserProfileData } from '../types';
import { useUpdateProfile } from '../hooks/useProfile';
import { prepareAvatar } from '../utils/prepareAvatar';

export interface ProfileCardProps {
  profile: UserProfileData;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [brokenAvatar, setBrokenAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const updateProfile = useUpdateProfile();
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'P';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarError('');
    setIsSavingAvatar(true);
    try {
      const avatarUrl = await prepareAvatar(file);
      await updateProfile.mutateAsync({ avatarUrl });
      setBrokenAvatar(null);
    } catch {
      setAvatarError('Không thể lưu ảnh. Hãy chọn ảnh hợp lệ (tối đa 5 MB) và thử lại.');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="relative h-28 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_24%),linear-gradient(135deg,#4F46E5_0%,#6366F1_48%,#3B82F6_100%)]">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute right-5 top-5 hidden rounded-full bg-white/18 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm sm:inline-flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5" />
          Sinh viên Ưu tú
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6">
        <div className="-mt-12 flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-[#EEF2FF] to-[#DBEAFE] shadow-lg">
              {profile.avatarUrl && brokenAvatar !== profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  onError={() => setBrokenAvatar(profile.avatarUrl)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-[#4F46E5]">
                  {initials}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-md transition hover:bg-[#4338CA]"
                title="Đổi ảnh đại diện"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isSavingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-2xl font-extrabold leading-tight text-[#131B2E]">
                  {profile.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-bold text-[#047857] ring-1 ring-[#A7F3D0]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đang học
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#64748B]">
                <Mail className="h-4 w-4 text-[#94A3B8]" />
                {profile.email}
              </p>
            </div>
          </div>

          {isSavingAvatar && <p role="status" className="text-sm text-[#64748B]">Đang lưu ảnh đại diện...</p>}
          {avatarError && <p role="alert" className="text-sm text-red-600">{avatarError}</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'MSSV', value: profile.studentId, icon: GraduationCap },
              { label: 'Ngành học', value: profile.major, icon: Building2 },
              { label: 'Tham gia', value: profile.joinedDate, icon: Calendar },
            ].map((item) => (
              <div
                key={item.label}
                className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4F46E5] shadow-xs ring-1 ring-[#E2E8F0]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#64748B]">{item.label}</p>
                  <p className="mt-0.5 truncate text-sm font-extrabold text-[#131B2E]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
