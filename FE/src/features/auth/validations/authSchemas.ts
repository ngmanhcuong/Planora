import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Vui lòng nhập địa chỉ email' })
    .email({ message: 'Email không hợp lệ. Vui lòng kiểm tra lại' }),
  password: z
    .string()
    .min(1, { message: 'Vui lòng nhập mật khẩu' })
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    fullname: z
      .string()
      .min(1, { message: 'Vui lòng nhập họ và tên' })
      .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' }),
    email: z
      .string()
      .min(1, { message: 'Vui lòng nhập địa chỉ email' })
      .email({ message: 'Email không hợp lệ. Vui lòng kiểm tra lại' }),
    phone: z
      .string()
      .min(1, { message: 'Vui lòng nhập số điện thoại' })
      .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ (Ví dụ: 0912345678)' }),
    purpose: z
      .string()
      .min(1, { message: 'Vui lòng chọn mục đích sử dụng' }),
    password: z
      .string()
      .min(1, { message: 'Vui lòng nhập mật khẩu' })
      .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Vui lòng nhập lại mật khẩu xác nhận' }),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'Bạn cần chấp nhận các điều khoản dịch vụ để tiếp tục' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập',
    path: ['confirmPassword'],
  });
