import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getHealthStatus = (req: Request, res: Response): void => {
  sendSuccess(res, 'Planora API is running', {
    status: 'up',
    timestamp: new Date().toISOString(),
  });
};

export const getReadinessStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, 'Planora API and Database are ready', {
      status: 'up',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    sendError(res, 'Database not ready', error.message || error, 503);
  }
};
