import { z } from 'zod';

export const taskPrioritizationSchema = z.object({
  taskIds: z.array(z.string()).optional(),
});

export const scheduleSchema = z.object({
  taskIds: z.array(z.string()).min(1, 'Cần ít nhất 1 công việc để lập lịch'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate phải có định dạng YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate phải có định dạng YYYY-MM-DD'),
  preferences: z
    .object({
      preferredSessionMinutes: z.number().min(15).max(240).optional(),
      breakMinutes: z.number().min(0).max(60).optional(),
    })
    .optional(),
});

export const applyScheduleSchema = z.object({
  sessions: z
    .array(
      z.object({
        taskId: z.string().min(1, 'taskId không được để trống'),
        start: z.string().min(1, 'start không được để trống'),
        end: z.string().min(1, 'end không được để trống'),
      })
    )
    .min(1, 'Cần ít nhất 1 buổi học để áp dụng'),
});

export const assistantSchema = z.object({
  message: z.string().min(1, 'Nội dung câu hỏi không được để trống').max(2000, 'Câu hỏi tối đa 2000 ký tự'),
});
