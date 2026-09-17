import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' }),
    email: z
      .string()
      .email({ message: 'Địa chỉ email không hợp lệ' }),
    password: z
      .string()
      .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Mật khẩu xác nhận không được để trống' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Địa chỉ email không hợp lệ' }),
  password: z
    .string()
    .min(1, { message: 'Mật khẩu không được để trống' }),
});

export const googleLoginSchema = z.object({
  credential: z
    .string()
    .min(1, { message: 'Thiếu mã xác thực Google' }),
});

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Địa chỉ email không hợp lệ' }),
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

export const requestPasswordResetOtpSchema = z.object({
  email: z
    .string()
    .email({ message: 'Địa chỉ email không hợp lệ' }),
});

export const verifyPasswordResetOtpSchema = z.object({
  email: z
    .string()
    .email({ message: 'Địa chỉ email không hợp lệ' }),
  otp: z
    .string()
    .regex(/^\d{6}$/, { message: 'Mã OTP phải gồm đúng 6 chữ số' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type RequestPasswordResetOtpInput = z.infer<typeof requestPasswordResetOtpSchema>;
export type VerifyPasswordResetOtpInput = z.infer<typeof verifyPasswordResetOtpSchema>;

