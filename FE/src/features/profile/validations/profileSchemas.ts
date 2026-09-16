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
  gpa: z.coerce
    .number({ message: 'GPA phải là một số' })
    .min(0, { message: 'GPA không được nhỏ hơn 0' })
    .max(4, { message: 'GPA không được lớn hơn 4.0' })
    .optional(),
  completedCredits: z.coerce
    .number({ message: 'Tín chỉ tích lũy phải là số' })
    .int({ message: 'Tín chỉ tích lũy phải là số nguyên' })
    .min(0, { message: 'Tín chỉ tích lũy không được nhỏ hơn 0' })
    .optional(),
  totalCredits: z.coerce
    .number({ message: 'Tổng tín chỉ phải là số' })
    .int({ message: 'Tổng tín chỉ phải là số nguyên' })
    .min(1, { message: 'Tổng tín chỉ phải lớn hơn 0' })
    .optional(),
  bio: z.string().max(200, { message: 'Tự giới thiệu tối đa 200 ký tự' }).optional(),
}).refine((data) => {
  if (data.completedCredits !== undefined && data.totalCredits !== undefined) {
    return data.completedCredits <= data.totalCredits;
  }
  return true;
}, {
  message: 'Tín chỉ tích lũy không được vượt quá tổng tín chỉ',
  path: ['completedCredits'],
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
