import React, { useEffect, useState } from 'react';
import { Award, Building2, Calendar, Camera, CheckCircle2, GraduationCap, Mail, X } from 'lucide-react';
import type { UserProfileData } from '../types';
import { useUpdateProfile } from '../hooks/useProfile';
import { prepareAvatar } from '../utils/prepareAvatar';
import { prepareCover } from '../utils/prepareCover';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { getProfileCopy } from '../i18n/profileCopy';
import { translateProfileDisplayValue } from '../utils/profileDisplay';

export interface ProfileCardProps {
  profile: UserProfileData;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const language = useCurrentLanguage();
  const copy = getProfileCopy(language);
  const [brokenAvatar, setBrokenAvatar] = useState<string | null>(null);
  const [brokenCover, setBrokenCover] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [coverError, setCoverError] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isSavingCover, setIsSavingCover] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<{ file: File; url: string } | null>(null);
  const [avatarZoom, setAvatarZoom] = useState(1.2);
  const [avatarOffsetX, setAvatarOffsetX] = useState(0);
  const [avatarOffsetY, setAvatarOffsetY] = useState(0);
  const [avatarDrag, setAvatarDrag] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [pendingCover, setPendingCover] = useState<{ file: File; url: string } | null>(null);
  const [coverZoom, setCoverZoom] = useState(1.2);
  const [coverOffsetX, setCoverOffsetX] = useState(0);
  const [coverOffsetY, setCoverOffsetY] = useState(0);
  const [coverDrag, setCoverDrag] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const updateProfile = useUpdateProfile();
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'P';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarError('');
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setAvatarError(copy.avatarSaveError);
      return;
    }
    if (pendingAvatar) URL.revokeObjectURL(pendingAvatar.url);
    setAvatarZoom(1.2);
    setAvatarOffsetX(0);
    setAvatarOffsetY(0);
    setPendingAvatar({ file, url: URL.createObjectURL(file) });
  };

  const closeAvatarEditor = () => {
    if (pendingAvatar) URL.revokeObjectURL(pendingAvatar.url);
    setPendingAvatar(null);
    setAvatarZoom(1.2);
    setAvatarOffsetX(0);
    setAvatarOffsetY(0);
  };

  const handleSaveAvatar = async () => {
    if (!pendingAvatar) return;
    setAvatarError('');
    setIsSavingAvatar(true);
    try {
      const avatarPanX = 50 - avatarOffsetX / Math.max(avatarZoom - 1, 0.01);
      const avatarPanY = 50 - avatarOffsetY / Math.max(avatarZoom - 1, 0.01);
      const avatarUrl = await prepareAvatar(pendingAvatar.file, { zoom: avatarZoom, x: avatarPanX, y: avatarPanY });
      await updateProfile.mutateAsync({ avatarUrl });
      setBrokenAvatar(null);
      closeAvatarEditor();
    } catch {
      setAvatarError(copy.avatarSaveError);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pendingCover) URL.revokeObjectURL(pendingCover.url);
      if (pendingAvatar) URL.revokeObjectURL(pendingAvatar.url);
    };
  }, [pendingAvatar, pendingCover]);

  const closeCoverEditor = () => {
    if (pendingCover) URL.revokeObjectURL(pendingCover.url);
    setPendingCover(null);
    setCoverZoom(1.2);
    setCoverOffsetX(0);
    setCoverOffsetY(0);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCoverError('');
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setCoverError(copy.coverSaveError);
      return;
    }
    if (pendingCover) URL.revokeObjectURL(pendingCover.url);
    setCoverZoom(1.2);
    setCoverOffsetX(0);
    setCoverOffsetY(0);
    setPendingCover({ file, url: URL.createObjectURL(file) });
  };

  const handleSaveCover = async () => {
    if (!pendingCover) return;
    setCoverError('');
    setIsSavingCover(true);
    try {
      const coverPanX = 50 - coverOffsetX / Math.max(coverZoom - 1, 0.01);
      const coverPanY = 50 - coverOffsetY / Math.max(coverZoom - 1, 0.01);
      const coverUrl = await prepareCover(pendingCover.file, { zoom: coverZoom, x: coverPanX, y: coverPanY });
      await updateProfile.mutateAsync({ coverUrl });
      setBrokenCover(null);
      closeCoverEditor();
    } catch {
      setCoverError(copy.coverSaveError);
    } finally {
      setIsSavingCover(false);
    }
  };

  const handleCoverPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!coverDrag) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const maxX = ((coverZoom - 1) * rect.width) / 2;
    const maxY = ((coverZoom - 1) * rect.height) / 2;
    const nextX = coverDrag.originX + event.clientX - coverDrag.startX;
    const nextY = coverDrag.originY + event.clientY - coverDrag.startY;
    setCoverOffsetX(Math.min(Math.max(nextX, -maxX), maxX));
    setCoverOffsetY(Math.min(Math.max(nextY, -maxY), maxY));
  };

  const stopCoverDrag = () => setCoverDrag(null);

  const handleAvatarPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!avatarDrag) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const maxX = ((avatarZoom - 1) * rect.width) / 2;
    const maxY = ((avatarZoom - 1) * rect.height) / 2;
    const nextX = avatarDrag.originX + event.clientX - avatarDrag.startX;
    const nextY = avatarDrag.originY + event.clientY - avatarDrag.startY;
    setAvatarOffsetX(Math.min(Math.max(nextX, -maxX), maxX));
    setAvatarOffsetY(Math.min(Math.max(nextY, -maxY), maxY));
  };

  const stopAvatarDrag = () => setAvatarDrag(null);

  const handleAvatarZoomChange = (value: number) => {
    setAvatarZoom(value);
    setAvatarOffsetX((current) => current * (value / avatarZoom));
    setAvatarOffsetY((current) => current * (value / avatarZoom));
  };

  const handleCoverZoomChange = (value: number) => {
    setCoverZoom(value);
    setCoverOffsetX((current) => current * (value / coverZoom));
    setCoverOffsetY((current) => current * (value / coverZoom));
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="relative h-44 overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_24%),linear-gradient(135deg,#4F46E5_0%,#6366F1_48%,#3B82F6_100%)] sm:h-52">
        {profile.coverUrl && brokenCover !== profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt=""
            onError={() => setBrokenCover(profile.coverUrl)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/20 via-transparent to-slate-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute right-5 top-5 hidden rounded-full bg-white/18 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm sm:inline-flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5" />
          {copy.excellentStudent}
        </div>
        <label
          htmlFor="cover-upload"
          className="absolute bottom-4 right-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-950/55 px-3 py-2 text-xs font-bold text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition hover:bg-slate-950/70"
          title={copy.changeCover}
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">{copy.changeCover}</span>
          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            disabled={isSavingCover}
            className="hidden"
          />
        </label>
      </div>

      <div className="px-5 pb-5 sm:px-6">
        <div className="-mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-[#EEF2FF] to-[#DBEAFE] shadow-lg sm:h-28 sm:w-28">
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
                title={copy.changeAvatar}
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
                  {copy.studying}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#64748B]">
                <Mail className="h-4 w-4 text-[#94A3B8]" />
                {profile.email}
              </p>
            </div>
          </div>

          {isSavingAvatar && <p role="status" className="text-sm text-[#64748B]">{copy.savingAvatar}</p>}
          {isSavingCover && <p role="status" className="text-sm text-[#64748B]">{copy.savingCover}</p>}
          {avatarError && <p role="alert" className="text-sm text-red-600">{avatarError}</p>}
          {coverError && <p role="alert" className="text-sm text-red-600">{coverError}</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: copy.studentId, value: profile.studentId, icon: GraduationCap },
              { label: copy.major, value: translateProfileDisplayValue(language, profile.major), icon: Building2 },
              { label: copy.joined, value: profile.joinedDate, icon: Calendar },
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
      {pendingAvatar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white">{copy.changeAvatar}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">Kéo ảnh để căn khuôn mặt trước khi lưu.</p>
              </div>
              <button
                type="button"
                onClick={closeAvatarEditor}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label={copy.cancel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div
                className={`relative mx-auto h-[360px] max-w-[360px] touch-none overflow-hidden rounded-3xl bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-700 ${avatarDrag ? 'cursor-grabbing' : 'cursor-grab'}`}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setAvatarDrag({ startX: event.clientX, startY: event.clientY, originX: avatarOffsetX, originY: avatarOffsetY });
                }}
                onPointerMove={handleAvatarPointerMove}
                onPointerUp={stopAvatarDrag}
                onPointerCancel={stopAvatarDrag}
              >
                <img
                  src={pendingAvatar.url}
                  alt=""
                  className="absolute inset-0 h-full w-full select-none object-cover opacity-45 blur-sm"
                  draggable={false}
                  style={{ transform: `translate(${avatarOffsetX}px, ${avatarOffsetY}px) scale(${avatarZoom})` }}
                />
                <div className="absolute inset-0 bg-slate-950/50" />
                <div className="absolute inset-8 overflow-hidden rounded-full shadow-2xl ring-2 ring-white">
                  <img
                    src={pendingAvatar.url}
                    alt=""
                    className="absolute inset-0 h-full w-full select-none object-cover"
                    draggable={false}
                    style={{ transform: `translate(${avatarOffsetX}px, ${avatarOffsetY}px) scale(${avatarZoom})` }}
                  />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs font-bold text-white/80">
                  Kéo ảnh để căn vị trí
                </div>
              </div>

              <label className="mx-auto block max-w-md space-y-2 text-xs font-bold text-slate-600 dark:text-slate-200">
                <div className="flex items-center justify-between">
                  <span>Zoom</span>
                  <span>{Math.round(avatarZoom * 100)}%</span>
                </div>
                <input className="w-full accent-indigo-600" type="range" min="1" max="3" step="0.05" value={avatarZoom} onChange={(event) => handleAvatarZoomChange(Number(event.target.value))} />
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAvatarEditor}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {copy.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveAvatar()}
                  disabled={isSavingAvatar}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-70"
                >
                  {isSavingAvatar ? copy.savingAvatar : copy.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {pendingCover && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white">{copy.changeCover}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">Chỉnh vị trí ảnh trước khi lưu.</p>
              </div>
              <button
                type="button"
                onClick={closeCoverEditor}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label={copy.cancel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div
                className={`relative h-[360px] touch-none overflow-hidden rounded-2xl bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-700 ${coverDrag ? 'cursor-grabbing' : 'cursor-grab'}`}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setCoverDrag({ startX: event.clientX, startY: event.clientY, originX: coverOffsetX, originY: coverOffsetY });
                }}
                onPointerMove={handleCoverPointerMove}
                onPointerUp={stopCoverDrag}
                onPointerCancel={stopCoverDrag}
              >
                <img
                  src={pendingCover.url}
                  alt=""
                  className="absolute inset-0 h-full w-full select-none object-cover opacity-45 blur-sm"
                  draggable={false}
                  style={{
                    transform: `translate(${coverOffsetX}px, ${coverOffsetY}px) scale(${coverZoom})`,
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/45" />
                <div className="absolute left-1/2 top-1/2 aspect-[6/1] w-[88%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-2xl ring-2 ring-white">
                  <img
                    src={pendingCover.url}
                    alt=""
                    className="absolute inset-0 h-full w-full select-none object-cover"
                    draggable={false}
                    style={{
                      transform: `translate(${coverOffsetX}px, ${coverOffsetY}px) scale(${coverZoom})`,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs font-bold text-white/80">
                  Kéo ảnh để căn vị trí
                </div>
              </div>

              <label className="mx-auto block max-w-md space-y-2 text-xs font-bold text-slate-600 dark:text-slate-200">
                <div className="flex items-center justify-between">
                  <span>Zoom</span>
                  <span>{Math.round(coverZoom * 100)}%</span>
                </div>
                <input className="w-full accent-indigo-600" type="range" min="1" max="3" step="0.05" value={coverZoom} onChange={(event) => handleCoverZoomChange(Number(event.target.value))} />
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCoverEditor}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {copy.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveCover()}
                  disabled={isSavingCover}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-70"
                >
                  {isSavingCover ? copy.savingCover : copy.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};





