import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Tên công việc không được để trống' })
    .max(120, { message: 'Tên công việc tối đa 120 ký tự' }),
  category: z.enum(['study', 'work', 'meeting', 'personal', 'habit', 'deadline']),
  priority: z.enum(['high', 'medium', 'low']),
  dueDate: z.string().min(1, { message: 'Vui lòng chọn ngày hết hạn' }),
  dueTime: z.string().optional(),
  description: z.string().optional(),
  courseCode: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
