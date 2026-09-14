import { Request, Response, NextFunction } from 'express';
import { TimetablesService } from './timetables.service';
import {
  createTimetableSchema,
  updateTimetableSchema,
  timetableListQuerySchema,
  createTimetableItemSchema,
  updateTimetableItemSchema,
  timetableConflictQuerySchema,
} from './timetables.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export class TimetablesController {
  /**
   * POST /api/timetables
   */
  static async createTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = createTimetableSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const timetable = await TimetablesService.createTimetable(userId, parseResult.data);
      sendSuccess(res, 'Tạo thời khóa biểu thành công', { timetable }, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/timetables
   */
  static async listTimetables(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const parseResult = timetableListQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số truy vấn không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await TimetablesService.listTimetables(userId, parseResult.data);
      sendSuccess(res, 'Lấy danh sách thời khóa biểu thành công', result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * GET /api/timetables/:id
   */
  static async getTimetableById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.id as string;
      const timetable = await TimetablesService.getTimetableById(userId, timetableId);
      sendSuccess(res, 'Lấy thông tin thời khóa biểu thành công', { timetable });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/timetables/:id
   */
  static async updateTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.id as string;
      const parseResult = updateTimetableSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const timetable = await TimetablesService.updateTimetable(userId, timetableId, parseResult.data);
      sendSuccess(res, 'Cập nhật thời khóa biểu thành công', { timetable });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /api/timetables/:id
   */
  static async deleteTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.id as string;
      await TimetablesService.deleteTimetable(userId, timetableId);
      sendSuccess(res, 'Xóa thời khóa biểu thành công');
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * POST /api/timetables/:timetableId/items
   */
  static async createTimetableItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.timetableId as string;
      const parseResult = createTimetableItemSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const item = await TimetablesService.createTimetableItem(userId, timetableId, parseResult.data);
      sendSuccess(res, 'Tạo tiết học thành công', { item }, 201);
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/timetables/:timetableId/items
   */
  static async listTimetableItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.timetableId as string;
      const items = await TimetablesService.listTimetableItems(userId, timetableId);
      sendSuccess(res, 'Lấy danh sách tiết học thành công', { items });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/timetables/:timetableId/items/:itemId
   */
  static async getTimetableItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.timetableId as string;
      const itemId = req.params.itemId as string;
      const item = await TimetablesService.getTimetableItemById(userId, timetableId, itemId);
      sendSuccess(res, 'Lấy thông tin tiết học thành công', { item });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu' || err.message === 'Không tìm thấy tiết học') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/timetables/:timetableId/items/:itemId
   */
  static async updateTimetableItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.timetableId as string;
      const itemId = req.params.itemId as string;
      const parseResult = updateTimetableItemSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const item = await TimetablesService.updateTimetableItem(userId, timetableId, itemId, parseResult.data);
      sendSuccess(res, 'Cập nhật tiết học thành công', { item });
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu' || err.message === 'Không tìm thấy tiết học') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      if (err.message.includes('Thời gian kết thúc')) {
        sendError(res, err.message, undefined, 400);
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /api/timetables/:timetableId/items/:itemId
   */
  static async deleteTimetableItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.timetableId as string;
      const itemId = req.params.itemId as string;
      await TimetablesService.deleteTimetableItem(userId, timetableId, itemId);
      sendSuccess(res, 'Xóa tiết học thành công');
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu' || err.message === 'Không tìm thấy tiết học') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/timetables/:timetableId/conflicts/check
   */
  static async checkConflicts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const timetableId = req.params.timetableId as string;
      const parseResult = timetableConflictQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Tham số không hợp lệ';
        sendError(res, firstError, parseResult.error.format(), 400);
        return;
      }

      const result = await TimetablesService.checkConflicts(userId, timetableId, parseResult.data);
      sendSuccess(res, 'Kiểm tra xung đột tiết học thành công', result);
    } catch (err: any) {
      if (err.message === 'Không tìm thấy thời khóa biểu') {
        sendError(res, err.message, undefined, 404);
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/timetable/week
   */
  static async getWeeklyTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 'Chưa xác thực người dùng', undefined, 401);
        return;
      }

      const result = await TimetablesService.getWeeklyTimetable(userId);
      sendSuccess(res, 'Lấy thời khóa biểu tuần thành công', result);
    } catch (err: any) {
      next(err);
    }
  }
}
