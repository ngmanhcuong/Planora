import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookmarkPlus, Calendar, Clock, BookOpen, Loader2 } from 'lucide-react';
import { createTaskSchema, type CreateTaskInput } from '../validations/taskSchemas';
import { useCreateTask } from '../hooks/useTasks';

export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createTaskMutation = useCreateTask();

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
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo công việc / Deadline mới" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Title */}
        <Input
          label="Tên công việc / Hạn chót *"
          placeholder="VD: Hoàn thành bài tập Lab 4"
          {...register('title')}
          error={errors.title?.message}
        />

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">Danh mục</label>
            <select
              {...register('category')}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="study">Học tập</option>
              <option value="deadline">Sắp đến hạn (Deadline)</option>
              <option value="meeting">Cuộc họp</option>
              <option value="work">Công việc</option>
              <option value="personal">Cá nhân</option>
              <option value="habit">Thói quen</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">Độ ưu tiên</label>
            <select
              {...register('priority')}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="high">Gấp / Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Ngày hết hạn *"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            {...register('dueDate')}
            error={errors.dueDate?.message}
          />
          <Input
            label="Giờ hết hạn"
            type="time"
            leftIcon={<Clock className="w-4 h-4" />}
            {...register('dueTime')}
          />
        </div>

        {/* Course Code */}
        <Input
          label="Mã môn học liên quan (nếu có)"
          placeholder="VD: IT4010"
          leftIcon={<BookOpen className="w-4 h-4" />}
          {...register('courseCode')}
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#131B2E]">Mô tả chi tiết</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Thêm chi tiết hoặc ghi chú bài tập..."
            className="w-full p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#131B2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] mt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createTaskMutation.isPending}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={createTaskMutation.isPending}>
            {createTaskMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookmarkPlus className="w-4 h-4" />
            )}
            <span>{createTaskMutation.isPending ? 'Đang lưu...' : 'Lưu công việc'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
