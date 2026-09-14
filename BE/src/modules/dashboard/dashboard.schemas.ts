import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const monthRegex = /^\d{4}-\d{2}$/;

const isValidCalendarDate = (val: string) => {
  if (!dateRegex.test(val)) return false;
  const d = new Date(`${val}T00:00:00.000Z`);
  return !isNaN(d.getTime());
};

const isValidMonth = (val: string) => {
  if (!monthRegex.test(val)) return false;
  const [year, month] = val.split('-').map(Number);
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
};

export const weeklyStatsQuerySchema = z.object({
  date: z
    .string()
    .refine(isValidCalendarDate, { message: 'date không hợp lệ (định dạng YYYY-MM-DD)' })
    .optional(),
});

export const monthlyStatsQuerySchema = z.object({
  month: z
    .string()
    .refine(isValidMonth, { message: 'month không hợp lệ (định dạng YYYY-MM)' })
    .optional(),
});

export type WeeklyStatsQueryInput = z.infer<typeof weeklyStatsQuerySchema>;
export type MonthlyStatsQueryInput = z.infer<typeof monthlyStatsQuerySchema>;
