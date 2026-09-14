import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response => {
  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (statusCode === 500) {
    console.error('[Error Handler]:', err.stack || err.message);
  }

  const message =
    isProd && statusCode === 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  return sendError(res, message, undefined, statusCode);
};
