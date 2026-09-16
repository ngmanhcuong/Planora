import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema, googleLoginSchema } from './auth.schemas';
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
