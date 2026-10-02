import type { NextFunction, Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import { createNoteSchema, updateNoteSchema } from './notes.schemas';
import { NotesService } from './notes.service';

export class NotesController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) return sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      const notes = await NotesService.list(req.user.userId);
      return sendSuccess(res, 'Lấy danh sách ghi chú thành công', { notes });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) return sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      const parsed = createNoteSchema.safeParse(req.body);
      if (!parsed.success) return sendError(res, parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ', parsed.error.format(), 400);
      const note = await NotesService.create(req.user.userId, parsed.data);
      return sendSuccess(res, 'Tạo ghi chú thành công', { note }, 201);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) return sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      const parsed = updateNoteSchema.safeParse(req.body);
      if (!parsed.success) return sendError(res, parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ', parsed.error.format(), 400);
      const note = await NotesService.update(req.user.userId, String(req.params.id), parsed.data);
      return sendSuccess(res, 'Cập nhật ghi chú thành công', { note });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy ghi chú') return sendError(res, error.message, undefined, 404);
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) return sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      await NotesService.remove(req.user.userId, String(req.params.id));
      return sendSuccess(res, 'Xóa ghi chú thành công');
    } catch (error: any) {
      if (error.message === 'Không tìm thấy ghi chú') return sendError(res, error.message, undefined, 404);
      next(error);
    }
  }
}
