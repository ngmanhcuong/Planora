import type { NextFunction, Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import { createGoalSchema, updateGoalSchema } from './goals.schemas';
import { GoalsService } from './goals.service';

export class GoalsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) return sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      const goals = await GoalsService.list(req.user.userId);
      return sendSuccess(res, 'Lấy danh sách mục tiêu thành công', { goals });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) return sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      const parsed = createGoalSchema.safeParse(req.body);
      if (!parsed.success) return sendError(res, parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ', parsed.error.format(), 400);
      const goal = await GoalsService.create(req.user.userId, parsed.data);
      return sendSuccess(res, 'Tạo mục tiêu thành công', { goal }, 201);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) return sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      const parsed = updateGoalSchema.safeParse(req.body);
      if (!parsed.success) return sendError(res, parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ', parsed.error.format(), 400);
      const goal = await GoalsService.update(req.user.userId, String(req.params.id), parsed.data);
      return sendSuccess(res, 'Cập nhật mục tiêu thành công', { goal });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy mục tiêu') return sendError(res, error.message, undefined, 404);
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) return sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      await GoalsService.remove(req.user.userId, String(req.params.id));
      return sendSuccess(res, 'Xóa mục tiêu thành công');
    } catch (error: any) {
      if (error.message === 'Không tìm thấy mục tiêu') return sendError(res, error.message, undefined, 404);
      next(error);
    }
  }
}
