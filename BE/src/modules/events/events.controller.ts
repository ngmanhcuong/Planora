import { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service';
import {
  createEventSchema,
  updateEventSchema,
  eventListQuerySchema,
  conflictCheckSchema,
  calendarRangeSchema,
} from './events.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export class EventsController {
  /**
   * POST /api/events
   */
  static async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = createEventSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const event = await EventsService.createEvent(userId, parseResult.data);
      sendSuccess(res, 'Tạo sự kiện thành công', { event }, 201);
    } catch (err: any) {
      if (err.message.includes('Danh mục không hợp lệ') || err.message.includes('Thời gian kết thúc')) {
        sendError(res, err.message, undefined, 400);
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/events
   */
  static async listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = eventListQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số truy vấn không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await EventsService.listEvents(userId, parseResult.data);
      sendSuccess(res, 'Lấy danh sách sự kiện thành công', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/events/conflicts/check
   */
  static async checkConflicts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = conflictCheckSchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await EventsService.checkConflicts(userId, parseResult.data);
      sendSuccess(res, 'Kiểm tra xung đột thành công', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/events/:id
   */
  static async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const eventId = req.params.id as string;
      const event = await EventsService.getEventById(userId, eventId);
      sendSuccess(res, 'Lấy thông tin sự kiện thành công', { event });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy sự kiện') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/events/:id
   */
  static async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const eventId = req.params.id as string;
      const parseResult = updateEventSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const event = await EventsService.updateEvent(userId, eventId, parseResult.data);
      sendSuccess(res, 'Cập nhật sự kiện thành công', { event });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy sự kiện') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      if (err.message.includes('Danh mục') || err.message.includes('Thời gian kết thúc')) {
        sendError(res, err.message, undefined, 400);
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /api/events/:id
   */
  static async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const eventId = req.params.id as string;
      await EventsService.deleteEvent(userId, eventId);
      sendSuccess(res, 'Xóa sự kiện thành công');
    } catch (err: any) {
      if (err.message === 'Không tìm thấy sự kiện') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/calendar
   */
  static async getCalendarRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = calendarRangeSchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số khoảng thời gian không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await EventsService.getCalendarRange(userId, parseResult.data);
      sendSuccess(res, 'Lấy lịch làm việc thành công', result);
    } catch (err: any) {
      next(err);
    }
  }
}
