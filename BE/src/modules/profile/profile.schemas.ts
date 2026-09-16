import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
      .max(50, { message: 'Họ và tên tối đa 50 ký tự' })
      .optional(),
    email: z
      .string()
      .email({ message: 'Địa chỉ email không hợp lệ' })
      .optional(),
    studentId: z
      .string()
      .max(30, { message: 'Mã số sinh viên tối đa 30 ký tự' })
      .optional()
      .nullable(),
    major: z
      .string()
      .max(100, { message: 'Ngành học tối đa 100 ký tự' })
      .optional()
      .nullable(),
    university: z
      .string()
      .max(150, { message: 'Tên trường tối đa 150 ký tự' })
      .optional()
      .nullable(),
    gpa: z
      .number({ message: 'GPA phải là một số' })
      .min(0, { message: 'GPA không được nhỏ hơn 0' })
      .max(4, { message: 'GPA không được lớn hơn 4.0' })
      .optional(),
    completedCredits: z
      .number({ message: 'Tín chỉ tích lũy phải là số nguyên' })
      .int({ message: 'Tín chỉ tích lũy phải là số nguyên' })
      .min(0, { message: 'Tín chỉ tích lũy không được nhỏ hơn 0' })
      .optional(),
    totalCredits: z
      .number({ message: 'Tổng số tín chỉ phải là số nguyên' })
      .int({ message: 'Tổng số tín chỉ phải là số nguyên' })
      .min(1, { message: 'Tổng số tín chỉ phải lớn hơn 0' })
      .optional(),
    bio: z
      .string()
      .max(200, { message: 'Tự giới thiệu tối đa 200 ký tự' })
      .optional()
      .nullable(),
    avatarUrl: z
      .string()
      .url({ message: 'URL ảnh đại diện không hợp lệ' })
      .optional()
      .nullable()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.completedCredits !== undefined && data.totalCredits !== undefined) {
        return data.completedCredits <= data.totalCredits;
      }
      return true;
    },
    {
      message: 'Số tín chỉ đã hoàn thành không được vượt quá tổng số tín chỉ',
      path: ['completedCredits'],
    }
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
