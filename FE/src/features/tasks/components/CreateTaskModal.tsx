import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TimeWheel } from '@/components/ui/TimeWheel';
import { apiClient } from '@/lib/axios';
import {
  BookmarkPlus,
  Calendar,
  Clock,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { createTaskSchema, type CreateTaskInput } from '../validations/taskSchemas';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';
import { clsx } from 'clsx';
import type { ApiCategory, ApiTask } from '@/types';

type TaskCategoryOption = {
  id?: string;
  value: CreateTaskInput['category'];
  label: string;
  color: string;
};

export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: ApiTask | null;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const language = useCurrentLanguage();
  const isEditMode = Boolean(task);
  const categoriesQuery = useQuery({
    queryKey: ['task-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/events/categories');
      return response.data.data.categories as ApiCategory[];
    },
    enabled: isOpen,
  });

  const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateValue(new Date());

  const getTaskDateValue = (value?: string | null) => {
    if (!value) return todayStr;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return todayStr;
    return formatDateValue(parsed);
  };

  const getTaskPriorityValue = (value?: ApiTask['priority']) => {
    const priority = value?.toLowerCase();
    return priority === 'high' || priority === 'low' ? priority : 'medium';
  };

  const getTaskCategoryValue = (value?: ApiTask['category'] | null) => {
    const type = value?.type?.toLowerCase();
    if (type === 'work' || type === 'meeting' || type === 'personal' || type === 'habit' || type === 'deadline') {
      return type;
    }
    return 'study';
  };

  const getDefaultValues = (editingTask?: ApiTask | null): CreateTaskInput => ({
    title: editingTask?.title ?? '',
    category: getTaskCategoryValue(editingTask?.category),
    priority: getTaskPriorityValue(editingTask?.priority),
    dueDate: getTaskDateValue(editingTask?.dueDate),
    dueTime: editingTask?.dueTime ?? '23:59',
    courseCode: editingTask?.courseCode ?? '',
    description: editingTask?.description ?? '',
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: getDefaultValues(task),
  });

  const selectedDate = watch('dueDate');
  const selectedTime = watch('dueTime') || '23:59';
  const selectedCategory = watch('category');
  const selectedPriority = watch('priority');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsCalendarOpen(false);
      setIsTimePickerOpen(false);
      setIsCategoryOpen(false);
      setIsPriorityOpen(false);
      return;
    }

    reset(getDefaultValues(task));
    setIsCalendarOpen(false);
    setIsTimePickerOpen(false);
    setIsCategoryOpen(false);
    setIsPriorityOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task?.id]);

  useEffect(() => {
    if (selectedDate) {
      setCalendarMonth(new Date(`${selectedDate}T00:00:00`));
    }
  }, [selectedDate]);

  const onSubmit = (data: CreateTaskInput) => {
    const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH',
      urgent: 'URGENT',
    };
    const selectedCategoryId =
      categoryOptions.find((option) => option.value === data.category && 'id' in option)?.id ??
      (task?.category?.type?.toLowerCase() === data.category ? task.categoryId : undefined);

    const payload = {
      title: data.title,
      priority: priorityMap[data.priority] || 'MEDIUM',
      dueDate: data.dueDate,
      dueTime: data.dueTime || undefined,
      courseCode: data.courseCode || undefined,
      description: data.description || undefined,
      categoryId: selectedCategoryId ?? null,
    };

    if (task) {
      updateTaskMutation.mutate(
        {
          id: task.id,
          data: payload,
        },
        {
          onSuccess: () => {
            reset(getDefaultValues(null));
            onClose();
          },
        }
      );
      return;
    }

    createTaskMutation.mutate(
      payload,
      {
        onSuccess: () => {
          reset(getDefaultValues(null));
          onClose();
        },
      }
    );
  };

  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chọn ngày';

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    });
  }, [calendarMonth]);

  const changeMonth = (delta: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const selectDate = (date: Date) => {
    const value = formatDateValue(date);
    setValue('dueDate', value, { shouldDirty: true, shouldValidate: true });
    setIsCalendarOpen(false);
  };

  const fallbackCategoryOptions: TaskCategoryOption[] = [
    { value: 'study', label: translate(language, 'category.study'), color: '#3B82F6' },
    { value: 'deadline', label: translate(language, 'category.deadline'), color: '#F43F5E' },
    { value: 'meeting', label: translate(language, 'category.meeting'), color: '#8B5CF6' },
    { value: 'work', label: translate(language, 'category.work'), color: '#6366F1' },
    { value: 'personal', label: translate(language, 'category.personal'), color: '#EC4899' },
    { value: 'habit', label: translate(language, 'category.habit'), color: '#10B981' },
  ];
  const categoryOptions = categoriesQuery.data?.length
    ? categoriesQuery.data.reduce<TaskCategoryOption[]>((options, category) => {
        const value = category.type.toLowerCase();
        if (!['study', 'deadline', 'meeting', 'work', 'personal', 'habit'].includes(value)) {
          return options;
        }

        options.push({
            id: category.id,
            value: value as CreateTaskInput['category'],
            label: category.name,
            color: category.color,
        });
        return options;
      }, [])
    : fallbackCategoryOptions;

  const priorityOptions = [
    { value: 'high', label: translate(language, 'tasks.priority.high'), color: '#F43F5E' },
    { value: 'medium', label: translate(language, 'tasks.priority.medium'), color: '#F59E0B' },
    { value: 'low', label: translate(language, 'tasks.priority.low'), color: '#22C55E' },
  ] as const;

  const currentCategory =
    categoryOptions.find((option) => option.value === selectedCategory) ?? categoryOptions[0];
  const currentPriority =
    priorityOptions.find((option) => option.value === selectedPriority) ?? priorityOptions[1];

  const [selectedHour = '23', selectedMinute = '59'] = selectedTime.split(':');
  const timeHour12 = String(((Number(selectedHour) + 11) % 12) + 1).padStart(2, '0');
  const timeMeridiem = Number(selectedHour) >= 12 ? 'PM' : 'AM';
  const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

  const updateTime = (hour12: string, minute: string, meridiem: string) => {
    const hourNumber = Number(hour12);
    const hour24 =
      meridiem === 'PM'
        ? hourNumber === 12
          ? 12
          : hourNumber + 12
        : hourNumber === 12
          ? 0
          : hourNumber;

    setValue('dueTime', `${String(hour24).padStart(2, '0')}:${minute}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? (language === 'vi' ? 'Chỉnh sửa công việc' : 'Edit task') : translate(language, 'tasks.modal.title')}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[78vh] flex-col gap-5 overflow-y-auto pr-1">
        {/* Title */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/80 p-4">
          <Input
            label={translate(language, 'tasks.modal.name')}
            placeholder={translate(language, 'tasks.modal.namePlaceholder')}
            className="h-12 rounded-xl bg-white text-base"
            {...register('title')}
            error={errors.title?.message}
          />
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">
              {translate(language, 'tasks.modal.category')}
            </label>
            <input type="hidden" {...register('category')} />
            <div className="relative z-40">
              <button
                type="button"
                onClick={() => {
                  setIsPriorityOpen(false);
                  setIsCalendarOpen(false);
                  setIsTimePickerOpen(false);
                  setIsCategoryOpen((value) => !value);
                }}
                className={clsx(
                  'flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-sm font-semibold text-[#131B2E] shadow-sm transition-all',
                  isCategoryOpen
                    ? 'border-[#4F46E5] ring-4 ring-[#4F46E5]/10'
                    : 'border-[#E2E8F0] hover:border-[#C7D2FE]'
                )}
                aria-expanded={isCategoryOpen}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: currentCategory.color }} />
                  {currentCategory.label}
                </span>
                <ChevronDown className={clsx('h-4 w-4 text-[#64748B] transition-transform', isCategoryOpen && 'rotate-180')} />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 top-[54px] z-50 w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] animate-in fade-in zoom-in-95 duration-150">
                  {categoryOptions.map((option) => {
                    const isSelected = option.value === selectedCategory;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue('category', option.value, { shouldDirty: true, shouldValidate: true });
                          setIsCategoryOpen(false);
                        }}
                        className={clsx(
                          'flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold transition-colors',
                          isSelected
                            ? 'bg-[#EEF2FF] text-[#4F46E5]'
                            : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#131B2E]'
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: option.color }} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">
              {translate(language, 'tasks.modal.priority')}
            </label>
            <input type="hidden" {...register('priority')} />
            <div className="relative z-30">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryOpen(false);
                  setIsCalendarOpen(false);
                  setIsTimePickerOpen(false);
                  setIsPriorityOpen((value) => !value);
                }}
                className={clsx(
                  'flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-sm font-semibold text-[#131B2E] shadow-sm transition-all',
                  isPriorityOpen
                    ? 'border-[#4F46E5] ring-4 ring-[#4F46E5]/10'
                    : 'border-[#E2E8F0] hover:border-[#C7D2FE]'
                )}
                aria-expanded={isPriorityOpen}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: currentPriority.color }} />
                  {currentPriority.label}
                </span>
                <ChevronDown className={clsx('h-4 w-4 text-[#64748B] transition-transform', isPriorityOpen && 'rotate-180')} />
              </button>

              {isPriorityOpen && (
                <div className="absolute left-0 top-[54px] z-50 w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] animate-in fade-in zoom-in-95 duration-150">
                  {priorityOptions.map((option) => {
                    const isSelected = option.value === selectedPriority;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue('priority', option.value, { shouldDirty: true, shouldValidate: true });
                          setIsPriorityOpen(false);
                        }}
                        className={clsx(
                          'flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold transition-colors',
                          isSelected
                            ? 'bg-[#EEF2FF] text-[#4F46E5]'
                            : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#131B2E]'
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: option.color }} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">
              {translate(language, 'tasks.modal.dueDate')}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCategoryOpen(false);
                setIsPriorityOpen(false);
                setIsTimePickerOpen(false);
                setIsCalendarOpen((value) => !value);
              }}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 text-left text-sm font-semibold text-[#131B2E] shadow-sm transition-all hover:border-[#C7D2FE] focus:border-[#4F46E5] focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10"
            >
              <span className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#64748B]" />
                {selectedDateLabel}
              </span>
              <ChevronDown className="h-4 w-4 text-[#64748B]" />
            </button>
            {errors.dueDate?.message && (
              <span className="text-xs font-medium text-[#F43F5E]">{errors.dueDate.message}</span>
            )}
            {isCalendarOpen && (
              <div className="absolute left-0 top-[74px] z-20 w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#131B2E]"
                    aria-label="Tháng trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="text-sm font-bold text-[#131B2E]">
                    {calendarMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#131B2E]"
                    aria-label="Tháng sau"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#94A3B8]">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                    <span key={day} className="py-1">{day}</span>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {calendarDays.map((date) => {
                    const value = formatDateValue(date);
                    const isSelected = value === selectedDate;
                    const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                    const isToday = value === todayStr;

                    return (
                      <button
                        type="button"
                        key={value}
                        onClick={() => selectDate(date)}
                        className={[
                          'h-9 rounded-lg text-sm font-semibold transition-all',
                          isSelected ? 'bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/25' : '',
                          !isSelected && isToday ? 'bg-[#EEF2FF] text-[#4F46E5]' : '',
                          !isSelected && !isToday && isCurrentMonth ? 'text-[#131B2E] hover:bg-[#F1F5F9]' : '',
                          !isSelected && !isCurrentMonth ? 'text-[#CBD5E1] hover:bg-[#F8FAFC]' : '',
                        ].join(' ')}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">
              {translate(language, 'tasks.modal.dueTime')}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryOpen(false);
                  setIsPriorityOpen(false);
                  setIsCalendarOpen(false);
                  setIsTimePickerOpen((value) => !value);
                }}
                className="flex h-12 w-full min-w-0 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 text-left shadow-sm transition-all hover:border-[#C7D2FE] focus:border-[#4F46E5] focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10"
              >
                <Clock className="h-4 w-4 shrink-0 text-[#64748B]" />
                <span className="flex-1 text-center text-sm font-bold text-[#131B2E]">
                  {timeHour12}:{selectedMinute} {timeMeridiem}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#64748B]" />
              </button>

              {isTimePickerOpen && (
                <div className="absolute right-0 top-[54px] z-30 w-full min-w-[300px] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-150">
                  {/* Header Toolbar */}
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-3">
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap text-xs font-black uppercase tracking-wider text-slate-500">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                      Chọn giờ
                    </span>

                    {/* AM / PM Toggle */}
                    <div className="flex shrink-0 rounded-xl border border-slate-200/70 bg-white p-1 shadow-sm">
                      {['AM', 'PM'].map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => updateTime(timeHour12, selectedMinute, period)}
                          className={clsx(
                            'h-8 min-w-11 rounded-lg px-3 text-xs font-black transition-all cursor-pointer',
                            timeMeridiem === period
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'text-indigo-600 hover:bg-indigo-50'
                          )}
                        >
                          {period}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTimePickerOpen(false)}
                      className="h-9 shrink-0 rounded-xl bg-indigo-50 px-3 text-xs font-extrabold text-indigo-600 transition-colors hover:bg-indigo-100 cursor-pointer"
                    >
                      Xong
                    </button>
                  </div>

                  {/* Hour & Minute Scroll Columns */}
                  <div className="p-3">
                  <div className="relative rounded-2xl border border-slate-100 bg-slate-50/90 p-2.5">
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 px-1 pb-2">
                      <div className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Giờ</div>
                      <div className="w-4" />
                      <div className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400">Phút</div>
                    </div>
                    <div className="pointer-events-none absolute left-2.5 right-7 top-[72px] h-9 rounded-xl bg-white ring-1 ring-indigo-100" />
                    <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] gap-3">
                      <TimeWheel label="Giờ" options={hourOptions} value={timeHour12} onChange={hour => updateTime(hour, selectedMinute, timeMeridiem)} />
                      <div className="flex h-[108px] w-4 items-center justify-center text-xl font-black text-slate-300">:</div>
                      <TimeWheel label="Phút" options={minuteOptions} value={selectedMinute} onChange={minute => updateTime(timeHour12, minute, timeMeridiem)} />
                    </div>

                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Code */}
        <Input
          label={translate(language, 'tasks.modal.courseCode')}
          placeholder={translate(language, 'tasks.modal.courseCodePlaceholder')}
          leftIcon={<BookOpen className="w-4 h-4" />}
          className="h-12 rounded-xl"
          {...register('courseCode')}
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#131B2E]">
            {translate(language, 'tasks.modal.description')}
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder={translate(language, 'tasks.modal.descriptionPlaceholder')}
            className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#131B2E] shadow-sm placeholder-[#94A3B8] transition-all focus:border-[#4F46E5] focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10"
          />
        </div>

        {/* Actions */}
        <div className="mt-1 flex items-center justify-end gap-2 border-t border-[#E2E8F0] pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
          >
            {translate(language, 'tasks.modal.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
            {createTaskMutation.isPending || updateTaskMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookmarkPlus className="w-4 h-4" />
            )}
            <span>
              {createTaskMutation.isPending || updateTaskMutation.isPending
                ? translate(language, 'tasks.modal.saving')
                : isEditMode
                  ? language === 'vi'
                    ? 'Cập nhật công việc'
                    : 'Update task'
                  : translate(language, 'tasks.modal.save')}
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
