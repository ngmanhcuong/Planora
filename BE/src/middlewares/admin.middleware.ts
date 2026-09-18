import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    sendError(res, 'Bạn không có quyền truy cập khu vực quản trị.', undefined, 403);
    return;
  }

  next();
};
