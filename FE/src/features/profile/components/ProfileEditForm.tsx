import React, { useEffect, useRef, useState } from 'react';
import { type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, BookOpen, Check, CheckCircle2, ChevronDown, Edit3, GraduationCap, Mail, Plus, Save, Search, School, User, X } from 'lucide-react';
import { updateProfileSchema, type UpdateProfileInput } from '../validations/profileSchemas';
import type { UserProfileData } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { getMultiLangText } from '@/lib/i18n';
import { translateProfileDisplayValue } from '../utils/profileDisplay';

const MAJOR_OPTIONS = [
  'Công nghệ thông tin',
  'Khoa học máy tính',
  'Kỹ thuật phần mềm',
  'Hệ thống thông tin',
  'An toàn thông tin',
  'Trí tuệ nhân tạo',
  'Khoa học dữ liệu',
  'Quản trị kinh doanh',
  'Kế toán',
  'Marketing',
  'Thiết kế đồ họa',
  'Ngôn ngữ Anh',
];

const UNIVERSITY_OPTIONS = [
  'Trường Đại học Công nghệ',
  'Đại học Bách khoa Hà Nội',
  'Đại học Công nghệ - ĐHQGHN',
  'Học viện Công nghệ Bưu chính Viễn thông',
  'Đại học FPT',
  'Đại học Kinh tế Quốc dân',
  'Đại học Thương mại',
  'Đại học Ngoại thương',
  'Đại học Quốc gia Hà Nội',
  'Đại học Quốc gia TP.HCM',
];

interface SelectableTextFieldProps {
  label: string;
  icon: React.ReactNode;
  options: string[];
  value?: string;
  error?: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const SelectableTextField: React.FC<SelectableTextFieldProps> = ({
  label,
  icon,
  options,
  value = '',
  error,
  placeholder,
  onChange,
}) => {
  const language = useCurrentLanguage();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const trimmedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) => option.toLowerCase().includes(trimmedQuery));
  const hasCustomValue = value && !options.includes(value);
  const selectCopy = {
    notUpdated: getMultiLangText(language, { vi: 'Chưa cập nhật', en: 'Not updated', es: 'Sin actualizar' }),
    search: getMultiLangText(language, { vi: 'Tìm trong danh sách...', en: 'Search the list...', es: 'Buscar en la lista...' }),
    noResult: getMultiLangText(language, { vi: 'Không có trong danh sách.', en: 'No matching option.', es: 'No está en la lista.' }),
    custom: getMultiLangText(language, { vi: 'Thêm tùy chỉnh', en: 'Add custom value', es: 'Agregar personalizado' }),
    chooseFromList: getMultiLangText(language, { vi: 'Chọn từ danh sách', en: 'Choose from list', es: 'Elegir de la lista' }),
  };
  const listMaxHeight = typeof panelStyle.maxHeight === 'number'
    ? Math.max(120, panelStyle.maxHeight - 112)
    : 208;

  const chooseValue = (nextValue: string) => {
    onChange(nextValue);
    setQuery('');
    setIsOpen(false);
    setIsCustom(false);
  };

  const updatePanelPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportPadding = 16;
    const preferredHeight = 360;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const openAbove = spaceBelow < 260 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(preferredHeight, Math.max(180, openAbove ? spaceAbove - 8 : spaceBelow - 8));

    setPanelStyle({
      left: rect.left,
      top: openAbove ? rect.top - maxHeight - 8 : rect.bottom + 8,
      width: rect.width,
      maxHeight,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();

    const closeIfOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    const reposition = () => updatePanelPosition();

    document.addEventListener('mousedown', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);

    return () => {
      document.removeEventListener('mousedown', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative w-full flex flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-wide text-[#131B2E]">{label}</label>

      {isCustom ? (
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
            {icon}
          </div>
          <input
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white py-2 pl-9 pr-10 text-sm text-[#131B2E] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              setIsOpen(true);
            }}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
            title={selectCopy.chooseFromList}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            updatePanelPosition();
            setIsOpen((current) => !current);
          }}
          className={`flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 text-left text-sm outline-none transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/20 ${
            isOpen
              ? 'border-[#4F46E5] shadow-[0_0_0_2px_rgba(79,70,229,0.10)]'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <span className="shrink-0 text-[#94A3B8]">{icon}</span>
          <span className={`min-w-0 flex-1 truncate ${value ? 'text-[#131B2E]' : 'text-[#94A3B8]'}`}>
            {value || selectCopy.notUpdated}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[#94A3B8] transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && !isCustom && (
        <div
          style={panelStyle}
          className="fixed z-50 rounded-2xl border border-[#CBD5E1] bg-white ring-1 ring-[#EEF2FF]"
        >
          <div className="overflow-hidden rounded-2xl">
            <div className="border-b border-[#E2E8F0] p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={selectCopy.search}
                className="h-9 w-full rounded-xl bg-[#F8FAFC] pl-9 pr-3 text-sm text-[#131B2E] outline-none ring-1 ring-[#E2E8F0] transition focus:bg-white focus:ring-[#4F46E5]"
                autoFocus
              />
            </div>
            </div>

            <div
              className="profile-select-scrollbar overflow-y-auto overscroll-contain p-1.5 pr-2"
              style={{ maxHeight: listMaxHeight }}
            >
            <button
              type="button"
              onClick={() => chooseValue('')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                !value
                  ? 'bg-[#EEF2FF] text-[#312E81] dark:bg-[#312E81] dark:text-white'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span>{selectCopy.notUpdated}</span>
              {!value && <Check className="h-4 w-4 text-[#4F46E5] dark:text-white" />}
            </button>

            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => chooseValue(option)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                  value === option
                    ? 'bg-[#EEF2FF] text-[#312E81] dark:bg-[#312E81] dark:text-white'
                    : 'text-[#131B2E] hover:bg-[#EEF2FF] dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{option}</span>
                {value === option && <Check className="h-4 w-4 text-[#4F46E5] dark:text-white" />}
              </button>
            ))}

            {filteredOptions.length === 0 && (
              <p className="px-3 py-2 text-xs text-[#64748B]">{selectCopy.noResult}</p>
            )}
            </div>

            <div className="border-t border-[#E2E8F0] p-2">
            <button
              type="button"
              onClick={() => {
                onChange(query.trim() || (hasCustomValue ? value : ''));
                setIsCustom(true);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#4F46E5] hover:bg-[#E0E7FF]"
            >
              <Plus className="h-4 w-4" />
              {selectCopy.custom}
            </button>
            </div>
          </div>
        </div>
      )}

      {error && <span className="text-xs font-medium text-[#F43F5E]">{error}</span>}
    </div>
  );
};

export interface ProfileEditFormProps {
  profile: UserProfileData;
  onSaveProfile: (updated: Partial<UserProfileData>) => void;
  isSaving?: boolean;
  saveError?: string | null;
  saveSuccess?: boolean;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  onSaveProfile,
  isSaving = false,
  saveError,
  saveSuccess = false,
}) => {
  const language = useCurrentLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [validationPopup, setValidationPopup] = useState<string | null>(null);
  const formValue = (value?: string) => value === 'Chưa cập nhật' ? '' : value;
  const copy = {
    notUpdated: getMultiLangText(language, { vi: 'Chưa cập nhật', en: 'Not updated', es: 'Sin actualizar' }),
    title: getMultiLangText(language, { vi: 'Thông tin cá nhân', en: 'Personal information', es: 'Información personal' }),
    subtitle: getMultiLangText(language, { vi: 'Xem và cập nhật thông tin hồ sơ hiển thị trên Planora.', en: 'View and update the profile information shown on Planora.', es: 'Consulta y actualiza la información del perfil que se muestra en Planora.' }),
    saved: getMultiLangText(language, { vi: 'Đã lưu', en: 'Saved', es: 'Guardado' }),
    cancel: getMultiLangText(language, { vi: 'Hủy', en: 'Cancel', es: 'Cancelar' }),
    save: getMultiLangText(language, { vi: 'Lưu thay đổi', en: 'Save changes', es: 'Guardar cambios' }),
    edit: getMultiLangText(language, { vi: 'Chỉnh sửa', en: 'Edit', es: 'Editar' }),
    contact: getMultiLangText(language, { vi: 'Thông tin liên hệ', en: 'Contact information', es: 'Información de contacto' }),
    academic: getMultiLangText(language, { vi: 'Thông tin học tập', en: 'Academic information', es: 'Información académica' }),
    fullName: getMultiLangText(language, { vi: 'Họ và tên', en: 'Full name', es: 'Nombre completo' }),
    email: getMultiLangText(language, { vi: 'Email', en: 'Email', es: 'Email' }),
    major: getMultiLangText(language, { vi: 'Ngành học', en: 'Major', es: 'Carrera' }),
    university: getMultiLangText(language, { vi: 'Trường Đại học', en: 'University', es: 'Universidad' }),
    completedCredits: getMultiLangText(language, { vi: 'Tín chỉ tích lũy', en: 'Completed credits', es: 'Créditos acumulados' }),
    totalCredits: getMultiLangText(language, { vi: 'Tổng tín chỉ', en: 'Total credits', es: 'Créditos totales' }),
    bioTitle: getMultiLangText(language, { vi: 'Giới thiệu bản thân', en: 'About me', es: 'Presentación personal' }),
    fullNamePlaceholder: getMultiLangText(language, { vi: 'Nhập họ và tên...', en: 'Enter your full name...', es: 'Introduce tu nombre completo...' }),
    majorPlaceholder: getMultiLangText(language, { vi: 'Nhập ngành học của bạn...', en: 'Enter your major...', es: 'Introduce tu carrera...' }),
    universityPlaceholder: getMultiLangText(language, { vi: 'Nhập tên trường của bạn...', en: 'Enter your university...', es: 'Introduce el nombre de tu universidad...' }),
    bioPlaceholder: getMultiLangText(language, { vi: 'Mô tả ngắn về sở thích, định hướng học tập...', en: 'Write a short note about your interests or study goals...', es: 'Describe brevemente tus intereses u objetivos académicos...' }),
    bioTip: getMultiLangText(language, { vi: 'Mẹo: phần giới thiệu nên ngắn gọn, nêu mục tiêu học tập hoặc phong cách làm việc của bạn.', en: 'Tip: keep the introduction short and mention your study goals or working style.', es: 'Consejo: mantén la presentación breve y menciona tus objetivos académicos o estilo de trabajo.' }),
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      studentId: formValue(profile.studentId),
      major: formValue(profile.major),
      university: formValue(profile.university),
      gpa: profile.gpa,
      completedCredits: profile.completedCredits,
      totalCredits: profile.totalCredits,
      bio: profile.bio,
    },
  });

  useEffect(() => {
    reset({
      name: profile.name,
      email: profile.email,
      studentId: formValue(profile.studentId),
      major: formValue(profile.major),
      university: formValue(profile.university),
      gpa: profile.gpa,
      completedCredits: profile.completedCredits,
      totalCredits: profile.totalCredits,
      bio: profile.bio,
    });
  }, [profile, reset]);

  useEffect(() => {
    if (saveSuccess) {
      setIsEditing(false);
    }
  }, [saveSuccess]);

  const onSubmit = (data: UpdateProfileInput) => {
    setValidationPopup(null);
    onSaveProfile(data);
  };

  const showValidationPopup = (formErrors: FieldErrors<UpdateProfileInput>) => {
    const firstError = Object.values(formErrors).find((error) => error?.message);
    setValidationPopup(firstError?.message?.toString() || 'Vui lòng kiểm tra lại thông tin vừa nhập.');
  };

  const handleCancel = () => {
    reset();
    setValidationPopup(null);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!validationPopup) return;
    const timer = window.setTimeout(() => setValidationPopup(null), 3500);
    return () => window.clearTimeout(timer);
  }, [validationPopup]);

  const displayValue = (value?: string) => value?.trim() || copy.notUpdated;
  const selectedMajor = watch('major') || '';
  const selectedUniversity = watch('university') || '';

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      {validationPopup && (
        <div
          role="alert"
          className="fixed right-5 top-24 z-[70] flex max-w-sm items-start gap-3 rounded-2xl border border-[#FECACA] bg-white px-4 py-3 text-sm font-semibold text-[#991B1B] shadow-xl shadow-slate-950/10 ring-1 ring-[#FEE2E2]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
          <span>{validationPopup}</span>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 border-b border-[#F1F5F9] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-[#131B2E]">{copy.title}</h3>
          <p className="mt-1 text-sm text-[#64748B]">{copy.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && !isEditing && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857]">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span>{copy.saved}</span>
            </div>
          )}

          {isEditing ? (
            <>
              <Button type="button" variant="secondary" onClick={handleCancel} className="rounded-xl">
                <X className="h-4 w-4" />
                <span>{copy.cancel}</span>
              </Button>
              <Button
                type="submit"
                form="profile-edit-form"
                variant="primary"
                isLoading={isSaving}
                className="rounded-xl px-5"
              >
                <Save className="h-4 w-4" />
                <span>{copy.save}</span>
              </Button>
            </>
          ) : (
            <Button type="button" variant="primary" onClick={() => setIsEditing(true)} className="rounded-xl">
              <Edit3 className="h-4 w-4" />
              <span>{copy.edit}</span>
            </Button>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-7">
            <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#131B2E]">
                <User className="h-4 w-4 text-[#4F46E5]" />
                {copy.contact}
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3 ring-1 ring-[#E2E8F0]">
                  <p className="text-xs font-semibold text-[#64748B]">{copy.fullName}</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#131B2E]">{displayValue(profile.name)}</p>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-[#E2E8F0]">
                  <p className="text-xs font-semibold text-[#64748B]">Email</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#131B2E]">{displayValue(profile.email)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#131B2E]">
                <GraduationCap className="h-4 w-4 text-[#4F46E5]" />
                {copy.academic}
              </h4>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {[
                  ['MSSV', profile.studentId],
                  [copy.major, translateProfileDisplayValue(language, profile.major)],
                  [copy.university, translateProfileDisplayValue(language, profile.university)],
                  ['GPA', `${profile.gpa} / 4.0`],
                  [copy.completedCredits, `${profile.completedCredits} TC`],
                  [copy.totalCredits, `${profile.totalCredits} TC`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white p-3 ring-1 ring-[#E2E8F0]">
                    <p className="text-xs font-semibold text-[#64748B]">{label}</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#131B2E]">{displayValue(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0] xl:col-span-5">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#131B2E]">
              <BookOpen className="h-4 w-4 text-[#4F46E5]" />
              {copy.bioTitle}
            </h4>
            <p className="min-h-[132px] rounded-xl bg-white p-3 text-sm leading-relaxed text-[#131B2E] ring-1 ring-[#E2E8F0]">
              {displayValue(profile.bio)}
            </p>
          </div>
        </div>
      ) : (
        <form id="profile-edit-form" noValidate onSubmit={handleSubmit(onSubmit, showValidationPopup)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-7">
              <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#131B2E]">
                  <User className="h-4 w-4 text-[#4F46E5]" />
                  {copy.contact}
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={`${copy.fullName} *`}
                    placeholder={copy.fullNamePlaceholder}
                    leftIcon={<User className="h-4 w-4" />}
                    {...register('name')}
                    error={errors.name?.message}
                    autoComplete="name"
                  />
                  <Input
                    label={`${copy.email} *`}
                    type="email"
                    placeholder="name@planora.edu.vn"
                    leftIcon={<Mail className="h-4 w-4" />}
                    {...register('email')}
                    error={errors.email?.message}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0]">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#131B2E]">
                  <GraduationCap className="h-4 w-4 text-[#4F46E5]" />
                  {copy.academic}
                </h4>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <Input
                    label="MSSV"
                    placeholder="VD: 2023601234"
                    leftIcon={<GraduationCap className="h-4 w-4" />}
                    {...register('studentId')}
                    error={errors.studentId?.message}
                  />
                  <input type="hidden" {...register('major')} />
                  <SelectableTextField
                    label={copy.major}
                    icon={<BookOpen className="h-4 w-4" />}
                    options={MAJOR_OPTIONS}
                    value={selectedMajor}
                    placeholder={copy.majorPlaceholder}
                    error={errors.major?.message}
                    onChange={(value) => setValue('major', value, { shouldDirty: true, shouldValidate: true })}
                  />

                  <input type="hidden" {...register('university')} />
                  <SelectableTextField
                    label={copy.university}
                    icon={<School className="h-4 w-4" />}
                    options={UNIVERSITY_OPTIONS}
                    value={selectedUniversity}
                    placeholder={copy.universityPlaceholder}
                    error={errors.university?.message}
                    onChange={(value) => setValue('university', value, { shouldDirty: true, shouldValidate: true })}
                  />
                  <Input
                    label="GPA"
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                    placeholder="VD: 3.5"
                    leftIcon={<GraduationCap className="h-4 w-4" />}
                    {...register('gpa')}
                    error={errors.gpa?.message}
                  />
                  <Input
                    label={copy.completedCredits}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="VD: 85"
                    leftIcon={<BookOpen className="h-4 w-4" />}
                    {...register('completedCredits')}
                    error={errors.completedCredits?.message}
                  />
                  <Input
                    label={copy.totalCredits}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="VD: 130"
                    leftIcon={<BookOpen className="h-4 w-4" />}
                    {...register('totalCredits')}
                    error={errors.totalCredits?.message}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-[#E2E8F0] xl:col-span-5">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#131B2E]">
                <BookOpen className="h-4 w-4 text-[#4F46E5]" />
                {copy.bioTitle}
              </h4>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#131B2E]">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={8}
                  placeholder={copy.bioPlaceholder}
                  className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#131B2E] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                />
                {errors.bio && <span className="text-xs font-medium text-[#BA1A1A]">{errors.bio.message}</span>}
              </div>
              <p className="mt-3 rounded-xl bg-white p-3 text-xs leading-relaxed text-[#64748B] ring-1 ring-[#E2E8F0]">
                {copy.bioTip}
              </p>
            </div>
          </div>

          {saveError && (
            <p className="rounded-xl bg-[#FFF1F2] px-3 py-2 text-xs font-semibold text-[#BA1A1A] ring-1 ring-[#FFE4E6]">
              {saveError}
            </p>
          )}
        </form>
      )}
    </section>
  );
};
