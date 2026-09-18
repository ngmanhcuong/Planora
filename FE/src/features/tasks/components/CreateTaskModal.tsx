import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
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
import { translate, getMultiLangText } from '@/lib/i18n';
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
      title={isEditMode ? getMultiLangText(language, { vi: 'Chỉnh sửa công việc', en: 'Edit task', ja: 'タスクを編集', ko: '작업 수정', zh: '编辑任务', fr: 'Modifier la tâche', de: 'Aufgabe bearbeiten', es: 'Editar tarea' }) : translate(language, 'tasks.modal.title')}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[78vh] flex-col gap-5 overflow-y-auto pr-1 pb-14">
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
          <DatePicker
            label={translate(language, 'tasks.modal.dueDate')}
            value={selectedDate}
            error={errors.dueDate?.message}
            onChange={(val) => setValue('dueDate', val, { shouldDirty: true, shouldValidate: true })}
          />
          <TimePicker
            label={translate(language, 'tasks.modal.dueTime')}
            value={selectedTime}
            error={errors.dueTime?.message}
            onChange={(val) => setValue('dueTime', val, { shouldDirty: true, shouldValidate: true })}
          />
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
                  ? getMultiLangText(language, { vi: 'Cập nhật công việc', en: 'Update task', ja: 'タスクを更新', ko: '작업 업데이트', zh: '更新任务', fr: 'Mettre à jour la tâche', de: 'Aufgabe aktualisieren', es: 'Actualizar tarea' })
                  : translate(language, 'tasks.modal.save')}
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
