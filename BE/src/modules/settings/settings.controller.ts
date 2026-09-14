import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { updateSettingsSchema, changePasswordSchema } from './settings.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const settings = await settingsService.getSettings(userId);
    sendSuccess(res, 'Lấy cài đặt thành công', { settings }, 200);
  } catch (err: any) {
    next(err);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const parseResult = updateSettingsSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu cài đặt không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const settings = await settingsService.updateSettings(userId, parseResult.data);
    sendSuccess(res, 'Cập nhật cài đặt thành công', { settings }, 200);
  } catch (err: any) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu mật khẩu không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    await settingsService.changePassword(userId, parseResult.data);
    sendSuccess(res, 'Đổi mật khẩu thành công', null, 200);
  } catch (err: any) {
    if (err.message === 'Mật khẩu hiện tại không chính xác') {
      sendError(res, err.message, undefined, 400);
      return;
    }
    next(err);
  }
};
