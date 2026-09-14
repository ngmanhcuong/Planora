import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z
    .string({ message: 'Vui lòng nhập tên công việc' })
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên công việc phải có ít nhất 2 ký tự' })
        .max(120, { message: 'Tên công việc tối đa 120 ký tự' })
    ),
  description: z
    .string()
    .max(2000, { message: 'Mô tả tối đa 2000 ký tự' })
    .optional()
    .nullable(),
  priority: z
    .nativeEnum(TaskPriority, { message: 'Mức độ ưu tiên không hợp lệ' })
    .optional()
    .default(TaskPriority.MEDIUM),
  categoryId: z
    .string()
    .optional()
    .nullable(),
  dueDate: z
    .string({ message: 'Vui lòng nhập ngày hết hạn' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Ngày hết hạn không đúng định dạng ISO Datetime' }),
  dueTime: z
    .string()
    .max(10, { message: 'Giờ hết hạn tối đa 10 ký tự' })
    .optional()
    .nullable(),
  courseCode: z
    .string()
    .max(30, { message: 'Mã môn học tối đa 30 ký tự' })
    .optional()
    .nullable(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên công việc phải có ít nhất 2 ký tự' })
        .max(120, { message: 'Tên công việc tối đa 120 ký tự' })
    )
    .optional(),
  description: z
    .string()
    .max(2000, { message: 'Mô tả tối đa 2000 ký tự' })
    .optional()
    .nullable(),
  priority: z
    .nativeEnum(TaskPriority, { message: 'Mức độ ưu tiên không hợp lệ' })
    .optional(),
  categoryId: z
    .string()
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Ngày hết hạn không đúng định dạng ISO Datetime' })
    .optional(),
  dueTime: z
    .string()
    .max(10, { message: 'Giờ hết hạn tối đa 10 ký tự' })
    .optional()
    .nullable(),
  courseCode: z
    .string()
    .max(30, { message: 'Mã môn học tối đa 30 ký tự' })
    .optional()
    .nullable(),
});

export const changeTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED'], {
    message: 'Trạng thái không hợp lệ. Chỉ chấp nhận TODO, IN_PROGRESS hoặc COMPLETED',
  }),
});

export const taskListQuerySchema = z.object({
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'], { message: 'Trạng thái lọc không hợp lệ' })
    .optional(),
  priority: z
    .nativeEnum(TaskPriority, { message: 'Mức độ ưu tiên lọc không hợp lệ' })
    .optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1, { message: 'Trang phải từ 1 trở lên' })),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(
      z
        .number()
        .int()
        .min(1, { message: 'Số lượng phải từ 1 trở lên' })
        .max(100, { message: 'Số lượng tối đa 100' })
    ),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'], { message: 'Trường sắp xếp không hợp lệ' })
    .optional()
    .default('dueDate'),
  sortOrder: z
    .enum(['asc', 'desc'], { message: 'Thứ tự sắp xếp phải là asc hoặc desc' })
    .optional()
    .default('asc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;
