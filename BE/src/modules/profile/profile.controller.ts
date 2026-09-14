import { Request, Response, NextFunction } from 'express';
import { profileService } from './profile.service';
import { updateProfileSchema } from './profile.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const profile = await profileService.getProfile(userId);
    sendSuccess(res, 'Lấy thông tin hồ sơ thành công', { profile }, 200);
  } catch (err: any) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const profile = await profileService.updateProfile(userId, parseResult.data);
    sendSuccess(res, 'Cập nhật hồ sơ thành công', { profile }, 200);
  } catch (err: any) {
    if (err.message === 'Số tín chỉ đã hoàn thành không được vượt quá tổng số tín chỉ') {
      sendError(res, err.message, undefined, 400);
      return;
    }
    next(err);
  }
};
