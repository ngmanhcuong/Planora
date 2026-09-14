import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { weeklyStatsQuerySchema, monthlyStatsQuerySchema } from './dashboard.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export class DashboardController {
  /**
   * GET /api/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const data = await DashboardService.getDashboard(userId);
      sendSuccess(res, 'Lấy dữ liệu tổng quan thành công', data);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/dashboard/statistics/weekly
   */
  static async getWeeklyStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = weeklyStatsQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số ngày không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const data = await DashboardService.getWeeklyStatistics(userId, parseResult.data.date);
      sendSuccess(res, 'Lấy thống kê tuần thành công', data);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/dashboard/statistics/monthly
   */
  static async getMonthlyStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = monthlyStatsQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số tháng không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const data = await DashboardService.getMonthlyStatistics(userId, parseResult.data.month);
      sendSuccess(res, 'Lấy thống kê tháng thành công', data);
    } catch (err: any) {
      next(err);
    }
  }
}
