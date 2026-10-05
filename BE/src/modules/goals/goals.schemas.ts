import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().trim().min(2, 'Tên mục tiêu phải có ít nhất 2 ký tự').max(160)
    .transform((value) => value.toLocaleUpperCase('vi-VN')),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.string().trim().min(1).max(100),
  categoryColor: z.enum(['indigo', 'emerald', 'rose', 'amber', 'purple', 'sky']).optional().default('indigo'),
  targetDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Hạn chót không hợp lệ'),
  targetWorkload: z.number().int().min(1).max(1000).optional().default(1),
  isCompleted: z.boolean().optional().default(false),
});

export const updateGoalSchema = createGoalSchema;
