import { Request, Response, NextFunction } from 'express';
import { tasksService } from './tasks.service';
import {
  createTaskSchema,
  updateTaskSchema,
  changeTaskStatusSchema,
  taskListQuerySchema,
} from './tasks.schemas';
import { sendSuccess, sendError } from '../../utils/response';

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const task = await tasksService.createTask(userId, parseResult.data);
    sendSuccess(res, 'Tạo công việc thành công', { task }, 201);
  } catch (err: any) {
    if (
      err.message === 'Danh mục không tồn tại' ||
      err.message === 'Bạn không có quyền truy cập vào danh mục này'
    ) {
      sendError(res, err.message, undefined, 400);
      return;
    }
    next(err);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const parseResult = taskListQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Tham số truy vấn không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const result = await tasksService.getTasks(userId, parseResult.data);
    sendSuccess(res, 'Lấy danh sách công việc thành công', result, 200);
  } catch (err: any) {
    next(err);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await tasksService.getTaskById(userId, taskId);
    sendSuccess(res, 'Lấy thông tin công việc thành công', { task }, 200);
  } catch (err: any) {
    if (err.message === 'Không tìm thấy công việc') {
      sendError(res, err.message, undefined, 404);
      return;
    }
    next(err);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parseResult = updateTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const task = await tasksService.updateTask(userId, taskId, parseResult.data);
    sendSuccess(res, 'Cập nhật công việc thành công', { task }, 200);
  } catch (err: any) {
    if (err.message === 'Không tìm thấy công việc') {
      sendError(res, err.message, undefined, 404);
      return;
    }
    if (
      err.message === 'Danh mục không tồn tại' ||
      err.message === 'Bạn không có quyền truy cập vào danh mục này'
    ) {
      sendError(res, err.message, undefined, 400);
      return;
    }
    next(err);
  }
};

export const changeTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parseResult = changeTaskStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Trạng thái không hợp lệ';
      sendError(res, firstError, parseResult.error.format(), 400);
      return;
    }

    const task = await tasksService.changeTaskStatus(userId, taskId, parseResult.data.status as any);
    sendSuccess(res, 'Cập nhật trạng thái công việc thành công', { task }, 200);
  } catch (err: any) {
    if (err.message === 'Không tìm thấy công việc') {
      sendError(res, err.message, undefined, 404);
      return;
    }
    next(err);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Chưa xác thực người dùng', undefined, 401);
      return;
    }

    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await tasksService.deleteTask(userId, taskId);
    sendSuccess(res, 'Xóa công việc thành công', null, 200);
  } catch (err: any) {
    if (err.message === 'Không tìm thấy công việc') {
      sendError(res, err.message, undefined, 404);
      return;
    }
    next(err);
  }
};
