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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
