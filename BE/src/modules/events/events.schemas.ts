import { z } from 'zod';
import { RecurrenceType } from '@prisma/client';

const isValidIsoDate = (val: string) => !isNaN(Date.parse(val));

export const createEventSchema = z.object({
  title: z
    .string({ message: 'Tiêu đề sự kiện là bắt buộc' })
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tiêu đề sự kiện phải từ 2 kí tự' })
        .max(120, { message: 'Tiêu đề sự kiện tối đa 120 kí tự' })
    ),
  description: z.string().max(2000, { message: 'Mô tả tối đa 2000 kí tự' }).optional().nullable(),
  location: z.string().max(200, { message: 'Địa điểm tối đa 200 kí tự' }).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  startAt: z
    .string({ message: 'Thời gian bắt đầu là bắt buộc' })
    .refine(isValidIsoDate, { message: 'Thời gian bắt đầu không hợp lệ (ISO format)' }),
  endAt: z
    .string({ message: 'Thời gian kết thúc là bắt buộc' })
    .refine(isValidIsoDate, { message: 'Thời gian kết thúc không hợp lệ (ISO format)' }),
  allDay: z.boolean().optional().default(false),
  recurrenceType: z.nativeEnum(RecurrenceType).optional().default(RecurrenceType.NONE),
  recurrenceInterval: z.number().int().min(1, { message: 'Khoảng thời gian lặp lại phải từ 1' }).optional().default(1),
  recurrenceEndDate: z
    .string()
    .refine(isValidIsoDate, { message: 'Ngày kết thúc lặp lại không hợp lệ' })
    .optional()
    .nullable(),
  color: z.string().optional(),
}).refine(
  (data) => {
    const start = new Date(data.startAt);
    const end = new Date(data.endAt);
    return end > start;
  },
  {
    message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu',
    path: ['endAt'],
  }
).refine(
  (data) => {
    if (data.recurrenceEndDate) {
      const start = new Date(data.startAt);
      const recEnd = new Date(data.recurrenceEndDate);
      return recEnd >= start;
    }
    return true;
  },
  {
    message: 'Ngày kết thúc lặp lại phải lớn hơn hoặc bằng thời gian bắt đầu',
    path: ['recurrenceEndDate'],
  }
);

export const updateEventSchema = z.object({
  title: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: 'Tiêu đề sự kiện phải từ 2 kí tự' })
        .max(120, { message: 'Tiêu đề sự kiện tối đa 120 kí tự' })
    )
    .optional(),
  description: z.string().max(2000, { message: 'Mô tả tối đa 2000 kí tự' }).optional().nullable(),
  location: z.string().max(200, { message: 'Địa điểm tối đa 200 kí tự' }).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  startAt: z
    .string()
    .refine(isValidIsoDate, { message: 'Thời gian bắt đầu không hợp lệ (ISO format)' })
    .optional(),
  endAt: z
    .string()
    .refine(isValidIsoDate, { message: 'Thời gian kết thúc không hợp lệ (ISO format)' })
    .optional(),
  allDay: z.boolean().optional(),
  recurrenceType: z.nativeEnum(RecurrenceType).optional(),
  recurrenceInterval: z.number().int().min(1).optional(),
  recurrenceEndDate: z
    .string()
    .refine(isValidIsoDate, { message: 'Ngày kết thúc lặp lại không hợp lệ' })
    .optional()
    .nullable(),
  color: z.string().optional(),
}).refine(
  (data) => {
    if (data.startAt && data.endAt) {
      const start = new Date(data.startAt);
      const end = new Date(data.endAt);
      return end > start;
    }
    return true;
  },
  {
    message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu',
    path: ['endAt'],
  }
);

export const eventListQuerySchema = z.object({
  start: z.string().refine(isValidIsoDate).optional(),
  end: z.string().refine(isValidIsoDate).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 20), z.number().min(1).max(100).default(20)),
  sortBy: z
    .enum(['startAt', 'endAt', 'startTime', 'endTime', 'createdAt', 'updatedAt', 'title'])
    .optional()
    .default('startAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const conflictCheckSchema = z.object({
  startAt: z
    .string({ message: 'startAt là bắt buộc' })
    .refine(isValidIsoDate, { message: 'startAt không hợp lệ' }),
  endAt: z
    .string({ message: 'endAt là bắt buộc' })
    .refine(isValidIsoDate, { message: 'endAt không hợp lệ' }),
  excludeEventId: z.string().optional(),
}).refine(
  (data) => {
    const start = new Date(data.startAt);
    const end = new Date(data.endAt);
    return end > start;
  },
  {
    message: 'endAt phải lớn hơn startAt',
    path: ['endAt'],
  }
);

export const calendarRangeSchema = z.object({
  start: z
    .string({ message: 'start là bắt buộc' })
    .refine(isValidIsoDate, { message: 'start không hợp lệ (ISO format)' }),
  end: z
    .string({ message: 'end là bắt buộc' })
    .refine(isValidIsoDate, { message: 'end không hợp lệ (ISO format)' }),
}).refine(
  (data) => {
    const start = new Date(data.start);
    const end = new Date(data.end);
    return end > start;
  },
  {
    message: 'end phải lớn hơn start',
    path: ['end'],
  }
);

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
