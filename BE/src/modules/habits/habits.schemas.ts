import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isValidCalendarDate = (val: string) => {
  if (!dateRegex.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !isNaN(d.getTime());
};

export const createHabitSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên thói quen phải từ 2 kí tự' })
        .max(100, { message: 'Tên thói quen tối đa 100 kí tự' })
    )
    .optional(),
  title: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên thói quen phải từ 2 kí tự' })
        .max(100, { message: 'Tên thói quen tối đa 100 kí tự' })
    )
    .optional(),
  description: z.string().max(500, { message: 'Mô tả tối đa 500 kí tự' }).optional().nullable(),
  targetFrequency: z
    .number({ message: 'Mục tiêu tần suất phải là số nguyên từ 1 đến 7' })
    .int({ message: 'Mục tiêu tần suất phải là số nguyên' })
    .min(1, { message: 'Mục tiêu tần suất tối thiểu là 1 ngày/tuần' })
    .max(7, { message: 'Mục tiêu tần suất tối đa là 7 ngày/tuần' })
    .optional()
    .default(7),
  categoryId: z.string().optional().nullable(),
  color: z.string().optional(),
  icon: z.string().optional(),
}).refine(
  (data) => data.name || data.title,
  {
    message: 'Tên thói quen (name hoặc title) là bắt buộc',
    path: ['name'],
  }
);

export const updateHabitSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên thói quen phải từ 2 kí tự' })
        .max(100, { message: 'Tên thói quen tối đa 100 kí tự' })
    )
    .optional(),
  title: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên thói quen phải từ 2 kí tự' })
        .max(100, { message: 'Tên thói quen tối đa 100 kí tự' })
    )
    .optional(),
  description: z.string().max(500, { message: 'Mô tả tối đa 500 kí tự' }).optional().nullable(),
  targetFrequency: z
    .number()
    .int()
    .min(1, { message: 'Mục tiêu tần suất từ 1 đến 7' })
    .max(7, { message: 'Mục tiêu tần suất từ 1 đến 7' })
    .optional(),
  categoryId: z.string().optional().nullable(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const habitListQuerySchema = z.object({
  search: z.string().optional(),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().min(1).max(100).default(10)),
  completedToday: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
});

export const checkInSchema = z.object({
  date: z
    .string()
    .refine(isValidCalendarDate, { message: 'Định dạng ngày không hợp lệ (YYYY-MM-DD)' })
    .optional(),
});

export const habitHistoryQuerySchema = z.object({
  start: z
    .string()
    .refine(isValidCalendarDate, { message: 'start date không hợp lệ (YYYY-MM-DD)' })
    .optional(),
  end: z
    .string()
    .refine(isValidCalendarDate, { message: 'end date không hợp lệ (YYYY-MM-DD)' })
    .optional(),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 30), z.number().min(1).max(100).default(30)),
}).refine(
  (data) => {
    if (data.start && data.end) {
      return data.start <= data.end;
    }
    return true;
  },
  {
    message: 'start date phải nhỏ hơn hoặc bằng end date',
    path: ['start'],
  }
);

export const habitWeeklySummaryQuerySchema = z.object({
  date: z
    .string()
    .refine(isValidCalendarDate, { message: 'date không hợp lệ (YYYY-MM-DD)' })
    .optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
