import { z } from 'zod';
import { ClassType } from '@prisma/client';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createTimetableSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên thời khóa biểu phải từ 2 kí tự' })
        .max(100, { message: 'Tên thời khóa biểu tối đa 100 kí tự' })
    )
    .optional(),
  termName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên học kỳ phải từ 2 kí tự' })
        .max(100, { message: 'Tên học kỳ tối đa 100 kí tự' })
    )
    .optional(),
  academicYear: z.string().optional().default('2025-2026'),
  isActive: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
}).refine(
  (data) => data.name || data.termName,
  {
    message: 'Tên thời khóa biểu (name hoặc termName) là bắt buộc',
    path: ['name'],
  }
);

export const updateTimetableSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên thời khóa biểu phải từ 2 kí tự' })
        .max(100, { message: 'Tên thời khóa biểu tối đa 100 kí tự' })
    )
    .optional(),
  termName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên học kỳ phải từ 2 kí tự' })
        .max(100, { message: 'Tên học kỳ tối đa 100 kí tự' })
    )
    .optional(),
  academicYear: z.string().optional(),
  isActive: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
});

export const timetableListQuerySchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().min(1).max(100).default(10)),
  search: z.string().optional(),
  isActive: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
  isCurrent: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
});

export const createTimetableItemSchema = z.object({
  courseName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên môn học/tiết học phải từ 2 kí tự' })
        .max(120, { message: 'Tên môn học/tiết học tối đa 120 kí tự' })
    )
    .optional(),
  subjectName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên môn học/tiết học phải từ 2 kí tự' })
        .max(120, { message: 'Tên môn học/tiết học tối đa 120 kí tự' })
    )
    .optional(),
  courseCode: z.string().max(30, { message: 'Mã môn học tối đa 30 kí tự' }).optional().default(''),
  dayOfWeek: z.preprocess(
    (val) => Number(val),
    z.number().int().min(0, { message: 'Thứ trong tuần từ 0 (Thứ hai) đến 6 (Chủ nhật)' }).max(6, { message: 'Thứ trong tuần từ 0 (Thứ hai) đến 6 (Chủ nhật)' })
  ),
  startTime: z
    .string({ message: 'Thời gian bắt đầu là bắt buộc' })
    .regex(timeRegex, { message: 'Thời gian bắt đầu không hợp lệ (định dạng HH:mm, ví dụ 07:30)' }),
  endTime: z
    .string({ message: 'Thời gian kết thúc là bắt buộc' })
    .regex(timeRegex, { message: 'Thời gian kết thúc không hợp lệ (định dạng HH:mm, ví dụ 09:30)' }),
  room: z.string().max(100, { message: 'Phòng học tối đa 100 kí tự' }).optional().default(''),
  lecturer: z.string().max(100, { message: 'Giảng viên tối đa 100 kí tự' }).optional().default(''),
  classType: z.enum(['THEORY', 'PRACTICE', 'EXAM', 'LECTURE', 'LAB']).optional().default('THEORY'),
  type: z.enum(['THEORY', 'PRACTICE', 'EXAM', 'LECTURE', 'LAB']).optional().default('THEORY'),
  color: z.string().optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => data.courseName || data.subjectName,
  {
    message: 'Tên môn học (courseName hoặc subjectName) là bắt buộc',
    path: ['courseName'],
  }
).refine(
  (data) => data.endTime > data.startTime,
  {
    message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu',
    path: ['endTime'],
  }
);

export const updateTimetableItemSchema = z.object({
  courseName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên môn học phải từ 2 kí tự' })
        .max(120, { message: 'Tên môn học tối đa 120 kí tự' })
    )
    .optional(),
  subjectName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tên môn học phải từ 2 kí tự' })
        .max(120, { message: 'Tên môn học tối đa 120 kí tự' })
    )
    .optional(),
  courseCode: z.string().max(30).optional(),
  dayOfWeek: z
    .preprocess(
      (val) => (val !== undefined ? Number(val) : undefined),
      z.number().int().min(0).max(6)
    )
    .optional(),
  startTime: z.string().regex(timeRegex, { message: 'Định dạng startTime phải là HH:mm' }).optional(),
  endTime: z.string().regex(timeRegex, { message: 'Định dạng endTime phải là HH:mm' }).optional(),
  room: z.string().max(100).optional(),
  lecturer: z.string().max(100).optional(),
  classType: z.enum(['THEORY', 'PRACTICE', 'EXAM', 'LECTURE', 'LAB']).optional(),
  type: z.enum(['THEORY', 'PRACTICE', 'EXAM', 'LECTURE', 'LAB']).optional(),
  color: z.string().optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return data.endTime > data.startTime;
    }
    return true;
  },
  {
    message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu',
    path: ['endTime'],
  }
);

export const timetableConflictQuerySchema = z.object({
  dayOfWeek: z.preprocess(
    (val) => Number(val),
    z.number().int().min(0, { message: 'dayOfWeek từ 0 đến 6' }).max(6, { message: 'dayOfWeek từ 0 đến 6' })
  ),
  startTime: z
    .string({ message: 'startTime là bắt buộc' })
    .regex(timeRegex, { message: 'startTime không hợp lệ (HH:mm)' }),
  endTime: z
    .string({ message: 'endTime là bắt buộc' })
    .regex(timeRegex, { message: 'endTime không hợp lệ (HH:mm)' }),
  excludeItemId: z.string().optional(),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: 'endTime phải lớn hơn startTime',
    path: ['endTime'],
  }
);

export type CreateTimetableInput = z.infer<typeof createTimetableSchema>;
export type UpdateTimetableInput = z.infer<typeof updateTimetableSchema>;
export type CreateTimetableItemInput = z.infer<typeof createTimetableItemSchema>;
export type UpdateTimetableItemInput = z.infer<typeof updateTimetableItemSchema>;
