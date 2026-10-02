import { z } from 'zod';

const colorSchema = z.enum(['white', 'amber', 'sky', 'emerald', 'violet', 'rose']);

export const createNoteSchema = z.object({
  text: z.string().trim().min(1, 'Vui lòng nhập nội dung ghi chú').max(10000, 'Ghi chú tối đa 10.000 ký tự'),
  tag: z.string().trim().min(1).max(50).default('Ghi chú'),
  isPinned: z.boolean().default(false),
  color: colorSchema.default('white'),
});

export const updateNoteSchema = z.object({
  text: z.string().trim().min(1, 'Vui lòng nhập nội dung ghi chú').max(10000, 'Ghi chú tối đa 10.000 ký tự').optional(),
  tag: z.string().trim().min(1).max(50).optional(),
  isPinned: z.boolean().optional(),
  done: z.boolean().optional(),
  color: colorSchema.optional(),
}).refine((value) => Object.keys(value).length > 0, 'Không có dữ liệu cập nhật');
