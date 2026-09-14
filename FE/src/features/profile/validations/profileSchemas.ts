import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
    .max(50, { message: 'Họ và tên tối đa 50 ký tự' }),
  email: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
  studentId: z.string().optional(),
  major: z.string().optional(),
  university: z.string().optional(),
  bio: z.string().max(200, { message: 'Tự giới thiệu tối đa 200 ký tự' }).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
