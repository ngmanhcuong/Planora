import { Request, Response, NextFunction } from 'express';
import { HabitsService } from './habits.service';
import {
  createHabitSchema,
  updateHabitSchema,
  habitListQuerySchema,
  checkInSchema,
  habitHistoryQuerySchema,
  habitWeeklySummaryQuerySchema,
} from './habits.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export class HabitsController {
  /**
   * POST /api/habits
   */
  static async createHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = createHabitSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const habit = await HabitsService.createHabit(userId, parseResult.data);
      sendSuccess(res, 'Tạo thói quen thành công', { habit }, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/habits
   */
  static async listHabits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = habitListQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số truy vấn không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await HabitsService.listHabits(userId, parseResult.data);
      sendSuccess(res, 'Lấy danh sách thói quen thành công', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/habits/today
   */
  static async getTodayHabits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const result = await HabitsService.getTodayHabits(userId);
      sendSuccess(res, 'Lấy danh sách thói quen hôm nay thành công', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/habits/:id
   */
  static async getHabitById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const habitId = req.params.id as string;
      const habit = await HabitsService.getHabitById(userId, habitId);
      sendSuccess(res, 'Lấy thông tin thói quen thành công', { habit });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thói quen') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/habits/:id
   */
  static async updateHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const habitId = req.params.id as string;
      const parseResult = updateHabitSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const habit = await HabitsService.updateHabit(userId, habitId, parseResult.data);
      sendSuccess(res, 'Cập nhật thói quen thành công', { habit });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thói quen') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /api/habits/:id
   */
  static async deleteHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const habitId = req.params.id as string;
      await HabitsService.deleteHabit(userId, habitId);
      sendSuccess(res, 'Xóa thói quen thành công');
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thói quen') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * POST /api/habits/:id/check-in
   */
  static async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const habitId = req.params.id as string;
      const parseResult = checkInSchema.safeParse(req.body || {});
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const habit = await HabitsService.checkIn(userId, habitId, parseResult.data);
      sendSuccess(res, 'Đánh dấu hoàn thành thành công', { habit });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thói quen') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      if (err.message.includes('tương lai')) {
        sendError(res, err.message, undefined, 400);
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /api/habits/:id/check-in
   */
  static async undoCheckIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const habitId = req.params.id as string;
      const dateStr = req.query.date as string | undefined;

      const habit = await HabitsService.undoCheckIn(userId, habitId, dateStr);
      sendSuccess(res, 'Bỏ đánh dấu hoàn thành thành công', { habit });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thói quen') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/habits/:id/history
   */
  static async getHabitHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const habitId = req.params.id as string;
      const parseResult = habitHistoryQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await HabitsService.getHabitHistory(userId, habitId, parseResult.data);
      sendSuccess(res, 'Lấy lịch sử thói quen thành công', result);
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thói quen') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/habits/:id/weekly-summary
   */
  static async getWeeklySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const habitId = req.params.id as string;
      const parseResult = habitWeeklySummaryQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await HabitsService.getWeeklySummary(userId, habitId, parseResult.data.date);
      sendSuccess(res, 'Lấy tóm tắt tuần thành công', result);
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thói quen') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }
}
