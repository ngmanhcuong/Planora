import { z } from 'zod';
import { ThemeMode, Language } from '@prisma/client';

export const updateSettingsSchema = z.object({
  theme: z.nativeEnum(ThemeMode, { message: 'Chủ đề giao diện không hợp lệ' }).optional(),
  language: z.nativeEnum(Language, { message: 'Ngôn ngữ không hợp lệ' }).optional(),
  deadlineReminderHours: z
    .number({ message: 'Thời gian nhắc nhở deadline phải là số nguyên' })
    .int({ message: 'Thời gian nhắc nhở deadline phải là số nguyên' })
    .min(0, { message: 'Thời gian nhắc nhở tối thiểu 0 giờ' })
    .max(168, { message: 'Thời gian nhắc nhở tối đa 168 giờ (7 ngày)' })
    .optional(),
  emailNotifications: z.boolean({ message: 'Thông báo email phải là kiểu boolean' }).optional(),
  pushNotifications: z.boolean({ message: 'Thông báo push phải là kiểu boolean' }).optional(),
  timetableAlerts: z.boolean({ message: 'Cảnh báo TKB phải là kiểu boolean' }).optional(),
  soundEffects: z.boolean({ message: 'Âm thanh phải là kiểu boolean' }).optional(),
  twoFactorAuth: z.boolean({ message: 'Xác thực 2 yếu tố phải là kiểu boolean' }).optional(),
  loginAlerts: z.boolean({ message: 'Cảnh báo đăng nhập phải là kiểu boolean' }).optional(),
  autoSaveDrafts: z.boolean({ message: 'Tự động lưu nháp phải là kiểu boolean' }).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Vui lòng nhập mật khẩu hiện tại' }),
    newPassword: z
      .string()
      .min(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Vui lòng nhập xác nhận mật khẩu mới' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
