import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Yêu cầu không hợp lệ. Vui lòng cung cấp Access Token.', undefined, 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    sendError(res, 'Access Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', undefined, 401);
    return;
  }

  req.user = payload;
  next();
};
