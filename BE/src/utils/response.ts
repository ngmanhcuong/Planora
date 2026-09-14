import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(res: Response, message: string, data?: T, statusCode = 200): Response => {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(body);
};

export const sendError = (res: Response, message: string, error?: any, statusCode = 400): Response => {
  const body: ApiResponse = {
    success: false,
    message,
    error,
  };
  return res.status(statusCode).json(body);
};
