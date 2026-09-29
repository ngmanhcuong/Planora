import { prisma } from '../../config/prisma';
import type { z } from 'zod';
import type { createGoalSchema } from './goals.schemas';

type CreateGoalInput = z.infer<typeof createGoalSchema>;

export class GoalsService {
  static list(userId: string) {
    return prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  static create(userId: string, input: CreateGoalInput) {
    return prisma.goal.create({
      data: {
        userId,
        title: input.title,
        description: input.description || null,
        category: input.category,
        categoryColor: input.categoryColor,
        targetDate: new Date(input.targetDate),
        targetWorkload: input.targetWorkload,
      },
    });
  }

  static async update(userId: string, goalId: string, input: CreateGoalInput) {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId }, select: { id: true } });
    if (!goal) throw new Error('Không tìm thấy mục tiêu');
    return prisma.goal.update({
      where: { id: goalId },
      data: {
        title: input.title,
        description: input.description || null,
        category: input.category,
        categoryColor: input.categoryColor,
        targetDate: new Date(input.targetDate),
        targetWorkload: input.targetWorkload,
      },
    });
  }

  static async remove(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId }, select: { id: true } });
    if (!goal) throw new Error('Không tìm thấy mục tiêu');
    await prisma.goal.delete({ where: { id: goalId } });
  }
}
