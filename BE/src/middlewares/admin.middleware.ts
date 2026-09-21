import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

const MANAGEMENT_ROLES = ['ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD'];

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.role || !MANAGEMENT_ROLES.includes(req.user.role)) {
    sendError(res, 'Bạn không có quyền truy cập khu vực quản trị.', undefined, 403);
    return;
  }

  next();
};
