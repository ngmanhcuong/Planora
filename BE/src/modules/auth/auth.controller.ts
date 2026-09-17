import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  requestPasswordResetOtpSchema,
  verifyPasswordResetOtpSchema,
} from './auth.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const result = await authService.register(parseResult.data);
    sendSuccess(res, 'Đăng ký tài khoản thành công', result, 201);
  } catch (err: any) {
    if (err.message === 'Email này đã được đăng ký tài khoản') {
      sendError(res, err.message, undefined, 400);
      return;
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const result = await authService.login(parseResult.data);
    sendSuccess(res, 'Đăng nhập thành công', result, 200);
  } catch (err: any) {
    if (err.message === 'Email hoặc mật khẩu không chính xác') {
      sendError(res, err.message, undefined, 401);
      return;
    }
    next(err);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = googleLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const result = await authService.googleLogin(parseResult.data);
    sendSuccess(res, 'Đăng nhập Google thành công', result, 200);
  } catch (err: any) {
    sendError(res, err.message || 'Đăng nhập Google thất bại', undefined, 400);
  }
};

export const requestPasswordResetOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = requestPasswordResetOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    await authService.requestPasswordResetOtp(parseResult.data);
    sendSuccess(res, 'Mã OTP đã được gửi đến email của bạn.', null, 200);
  } catch (err: any) {
    if (err.message === 'Không tìm thấy tài khoản với email này') {
      sendError(res, err.message, undefined, 404);
      return;
    }

    if (err.message === 'Chưa cấu hình SMTP để gửi OTP thật') {
      sendError(res, 'Chưa cấu hình email SMTP để gửi OTP thật. Vui lòng cấu hình SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS và SMTP_FROM.', undefined, 500);
      return;
    }

    if (err.code === 'EAUTH' || String(err.message || '').includes('Username and Password not accepted')) {
      sendError(res, 'Gmail từ chối đăng nhập SMTP. Vui lòng dùng Gmail App Password 16 ký tự cho SMTP_PASS, không dùng mật khẩu Gmail thường.', undefined, 500);
      return;
    }

    next(err);
  }
};

export const verifyPasswordResetOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = verifyPasswordResetOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    await authService.verifyPasswordResetOtp(parseResult.data);
    sendSuccess(res, 'Xác minh OTP thành công.', null, 200);
  } catch (err: any) {
    if (
      err.message === 'Mã OTP không tồn tại hoặc đã hết hạn' ||
      err.message === 'Mã OTP đã hết hạn' ||
      err.message === 'Mã OTP không chính xác' ||
      err.message === 'Bạn đã nhập sai OTP quá nhiều lần. Vui lòng gửi lại mã mới'
    ) {
      sendError(res, err.message, undefined, 400);
      return;
    }

    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    await authService.forgotPassword(parseResult.data);
    sendSuccess(res, 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.', null, 200);
  } catch (err: any) {
    if (err.message === 'Không tìm thấy tài khoản với email này') {
      sendError(res, err.message, undefined, 404);
      return;
    }
    if (err.message === 'Vui lòng xác minh OTP trước khi đặt lại mật khẩu') {
      sendError(res, err.message, undefined, 400);
      return;
    }
    next(err);
  }
};
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const user = await authService.getCurrentUser(userId);
    sendSuccess(res, 'Lấy thông tin người dùng thành công', { user }, 200);
  } catch (err: any) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(
    res,
    'Đăng xuất thành công. Vui lòng xóa Access Token ở phía Client.',
    null,
    200
  );
};

