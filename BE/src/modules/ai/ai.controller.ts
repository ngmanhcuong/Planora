import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service';
import { taskPrioritizationSchema, scheduleSchema, applyScheduleSchema, assistantSchema } from './ai.schemas';

// Simple in-memory rate limiter for AI requests per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_AI_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRecord = rateLimitMap.get(userId);

  if (!userRecord || now > userRecord.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (userRecord.count >= MAX_AI_REQUESTS) {
    return false;
  }

  userRecord.count += 1;
  return true;
}

export class AiController {
  static async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await aiService.getStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  static async prioritizeTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      if (!checkRateLimit(userId)) {
        res.status(429).json({
          success: false,
          message: 'Bạn đã vượt quá giới hạn lượt dùng AI. Vui lòng thử lại sau 10 phút.',
        });
        return;
      }

      const validated = taskPrioritizationSchema.parse(req.body);
      const result = await aiService.prioritizeTasks(userId, validated);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      if (!checkRateLimit(userId)) {
        res.status(429).json({
          success: false,
          message: 'Bạn đã vượt quá giới hạn lượt dùng AI. Vui lòng thử lại sau 10 phút.',
        });
        return;
      }

      const validated = scheduleSchema.parse(req.body);
      const result = await aiService.generateSchedule(userId, validated);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async applySchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validated = applyScheduleSchema.parse(req.body);
      const result = await aiService.applySchedule(userId, validated);

      res.json({
        success: true,
        message: `Đã lưu thành công ${result.appliedCount} lịch học tập mới vào Calendar.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async assistantChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      if (!checkRateLimit(userId)) {
        res.status(429).json({
          success: false,
          message: 'Bạn đã vượt quá giới hạn lượt dùng AI. Vui lòng thử lại sau 10 phút.',
        });
        return;
      }

      const validated = assistantSchema.parse(req.body);
      const result = await aiService.assistantChat(userId, validated);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
