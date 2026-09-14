import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { notificationListQuerySchema } from './notifications.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export class NotificationsController {
  /**
   * GET /api/notifications
   */
  static async listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = notificationListQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số truy vấn không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await NotificationsService.listNotifications(userId, parseResult.data);
      sendSuccess(res, 'Lấy danh sách thông báo thành công', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const result = await NotificationsService.getUnreadCount(userId);
      sendSuccess(res, 'Lấy số thông báo chưa đọc thành công', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/notifications/:id
   */
  static async getNotificationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const notificationId = req.params.id as string;
      const notification = await NotificationsService.getNotificationById(userId, notificationId);
      sendSuccess(res, 'Lấy thông tin thông báo thành công', { notification });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thông báo') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const notificationId = req.params.id as string;
      const notification = await NotificationsService.markAsRead(userId, notificationId);
      sendSuccess(res, 'Đánh dấu đã đọc thành công', { notification });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thông báo') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/notifications/:id/unread
   */
  static async markAsUnread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const notificationId = req.params.id as string;
      const notification = await NotificationsService.markAsUnread(userId, notificationId);
      sendSuccess(res, 'Đánh dấu chưa đọc thành công', { notification });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thông báo') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   */
  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const result = await NotificationsService.markAllAsRead(userId);
      sendSuccess(res, 'Đã đánh dấu tất cả thông báo là đã đọc', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * DELETE /api/notifications/:id
   */
  static async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const notificationId = req.params.id as string;
      await NotificationsService.deleteNotification(userId, notificationId);
      sendSuccess(res, 'Xóa thông báo thành công');
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thông báo') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /api/notifications/read
   */
  static async clearReadNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const result = await NotificationsService.clearReadNotifications(userId);
      sendSuccess(res, 'Đã xóa các thông báo đã đọc', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * POST /api/notifications/generate
   */
  static async generateDueNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const result = await NotificationsService.generateDueNotifications(userId);
      sendSuccess(res, 'Tạo thông báo nhắc nhở thành công', result);
    } catch (err: any) {
      next(err);
    }
  }
}
