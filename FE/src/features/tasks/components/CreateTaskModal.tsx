import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookmarkPlus, Calendar, Clock, BookOpen, Loader2 } from 'lucide-react';
import { createTaskSchema, type CreateTaskInput } from '../validations/taskSchemas';
import { useCreateTask } from '../hooks/useTasks';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createTaskMutation = useCreateTask();
  const language = useCurrentLanguage();

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      category: 'study',
      priority: 'medium',
      dueDate: todayStr,
      dueTime: '23:59',
      courseCode: '',
      description: '',
    },
  });

  const onSubmit = (data: CreateTaskInput) => {
    const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH',
      urgent: 'URGENT',
    };

    createTaskMutation.mutate(
      {
        title: data.title,
        priority: priorityMap[data.priority] || 'MEDIUM',
        dueDate: data.dueDate,
        dueTime: data.dueTime || undefined,
        courseCode: data.courseCode || undefined,
        description: data.description || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={translate(language, 'tasks.modal.title')} maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Title */}
        <Input
          label={translate(language, 'tasks.modal.name')}
          placeholder={translate(language, 'tasks.modal.namePlaceholder')}
          {...register('title')}
          error={errors.title?.message}
        />

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">
              {translate(language, 'tasks.modal.category')}
            </label>
            <select
              {...register('category')}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="study">{translate(language, 'category.study')}</option>
              <option value="deadline">{translate(language, 'category.deadline')}</option>
              <option value="meeting">{translate(language, 'category.meeting')}</option>
              <option value="work">{translate(language, 'category.work')}</option>
              <option value="personal">{translate(language, 'category.personal')}</option>
              <option value="habit">{translate(language, 'category.habit')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">
              {translate(language, 'tasks.modal.priority')}
            </label>
            <select
              {...register('priority')}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="high">{translate(language, 'tasks.priority.high')}</option>
              <option value="medium">{translate(language, 'tasks.priority.medium')}</option>
              <option value="low">{translate(language, 'tasks.priority.low')}</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={translate(language, 'tasks.modal.dueDate')}
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            {...register('dueDate')}
            error={errors.dueDate?.message}
          />
          <Input
            label={translate(language, 'tasks.modal.dueTime')}
            type="time"
            leftIcon={<Clock className="w-4 h-4" />}
            {...register('dueTime')}
          />
        </div>

        {/* Course Code */}
        <Input
          label={translate(language, 'tasks.modal.courseCode')}
          placeholder={translate(language, 'tasks.modal.courseCodePlaceholder')}
          leftIcon={<BookOpen className="w-4 h-4" />}
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
            className="w-full p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#131B2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] mt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createTaskMutation.isPending}>
            {translate(language, 'tasks.modal.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={createTaskMutation.isPending}>
            {createTaskMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookmarkPlus className="w-4 h-4" />
            )}
            <span>
              {createTaskMutation.isPending
                ? translate(language, 'tasks.modal.saving')
                : translate(language, 'tasks.modal.save')}
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
