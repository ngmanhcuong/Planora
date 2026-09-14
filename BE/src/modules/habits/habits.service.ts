import { prisma } from '../../config/prisma';
import {
  CreateHabitInput,
  UpdateHabitInput,
  CheckInInput,
  habitHistoryQuerySchema,
} from './habits.schemas';
import {
  HabitResponse,
  HabitListQuery,
  PaginatedHabitsResponse,
  HabitHistoryQuery,
  HabitHistoryResponse,
  HabitWeeklySummaryResponse,
  TodayHabitsResponse,
} from './habits.types';
import { z } from 'zod';

/**
 * Returns date in YYYY-MM-DD format
 */
export function normalizeDateString(dateInput?: string | Date): string {
  if (!dateInput) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof dateInput === 'string') {
    return dateInput.slice(0, 10);
  }

  const year = dateInput.getUTCFullYear ? dateInput.getUTCFullYear() : dateInput.getFullYear();
  const month = String((dateInput.getUTCMonth ? dateInput.getUTCMonth() : dateInput.getMonth()) + 1).padStart(2, '0');
  const day = String(dateInput.getUTCDate ? dateInput.getUTCDate() : dateInput.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateToUtc(dateStr: string): Date {
  return new Date(`${dateStr.slice(0, 10)}T00:00:00.000Z`);
}

export function getOffsetDateString(dateStr: string, offsetDays: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const DAY_NAMES = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

/**
 * Calculates current streak, best streak, last completed date, and completedToday from HabitLogs
 */
export function calculateStreaksFromLogs(
  logs: { completedDate: Date; isCompleted: boolean }[],
  todayStr: string
) {
  const completedLogs = logs.filter((l) => l.isCompleted);
  const dateStrings = Array.from(
    new Set(completedLogs.map((l) => normalizeDateString(l.completedDate)))
  ).sort();

  const datesSet = new Set(dateStrings);
  const isCompletedToday = datesSet.has(todayStr);
  const yesterdayStr = getOffsetDateString(todayStr, -1);

  let currentStreak = 0;
  if (isCompletedToday) {
    let checkDate = todayStr;
    while (datesSet.has(checkDate)) {
      currentStreak++;
      checkDate = getOffsetDateString(checkDate, -1);
    }
  } else if (datesSet.has(yesterdayStr)) {
    let checkDate = yesterdayStr;
    while (datesSet.has(checkDate)) {
      currentStreak++;
      checkDate = getOffsetDateString(checkDate, -1);
    }
  }

  // Calculate best streak historically
  let bestStreak = 0;
  let runningStreak = 0;

  for (let i = 0; i < dateStrings.length; i++) {
    if (i === 0) {
      runningStreak = 1;
    } else {
      const prevDate = dateStrings[i - 1];
      const expectedDate = getOffsetDateString(prevDate, 1);
      if (dateStrings[i] === expectedDate) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  const lastCompletedDateStr = dateStrings.length > 0 ? dateStrings[dateStrings.length - 1] : null;

  return {
    currentStreak,
    bestStreak,
    isCompletedToday,
    lastCompletedDateStr,
  };
}

function formatHabit(habit: any, todayStr = normalizeDateString()): HabitResponse {
  const logs = habit.logs || [];
  const streakData = calculateStreaksFromLogs(logs, todayStr);

  const isCompletedToday = streakData.isCompletedToday || (habit.logs ? false : habit.isCompletedToday);

  return {
    id: habit.id,
    userId: habit.userId,
    categoryId: habit.categoryId,
    name: habit.title,
    title: habit.title,
    description: habit.description,
    targetFrequency: habit.targetFrequency,
    currentStreak: streakData.currentStreak,
    bestStreak: Math.max(habit.bestStreak || 0, streakData.bestStreak),
    lastCompletedDate: streakData.lastCompletedDateStr || (habit.lastCompletedDate ? normalizeDateString(habit.lastCompletedDate) : null),
    isCompletedToday,
    completedToday: isCompletedToday,
    color: habit.color,
    icon: habit.icon,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
  };
}

export class HabitsService {
  /**
   * Create new habit
   */
  static async createHabit(userId: string, input: CreateHabitInput): Promise<HabitResponse> {
    const title = input.name || input.title || 'Thói quen mới';

    const habit = await prisma.habit.create({
      data: {
        userId,
        categoryId: input.categoryId || null,
        title,
        description: input.description || null,
        targetFrequency: input.targetFrequency ?? 7,
        color: input.color || '#006E4B',
        icon: input.icon || 'flame',
      },
      include: {
        logs: true,
      },
    });

    return formatHabit(habit);
  }

  /**
   * List habits with filtering, search, pagination
   */
  static async listHabits(userId: string, query: HabitListQuery): Promise<PaginatedHabitsResponse> {
    const { page = 1, limit = 10, search, completedToday } = query;
    const todayStr = normalizeDateString();

    const where: any = { userId };

    if (search && search.trim()) {
      where.title = { contains: search.trim() };
    }

    const rawHabits = await prisma.habit.findMany({
      where,
      include: {
        logs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let formatted = rawHabits.map((h) => formatHabit(h, todayStr));

    if (completedToday !== undefined) {
      formatted = formatted.filter((h) => h.isCompletedToday === completedToday);
    }

    const total = formatted.length;
    const paginated = formatted.slice((page - 1) * limit, page * limit);

    return {
      habits: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get habit by ID
   */
  static async getHabitById(userId: string, habitId: string): Promise<HabitResponse> {
    const todayStr = normalizeDateString();
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      },
      include: {
        logs: true,
      },
    });

    if (!habit) {
      throw new Error('Không tìm thấy thói quen');
    }

    return formatHabit(habit, todayStr);
  }

  /**
   * Update habit
   */
  static async updateHabit(userId: string, habitId: string, input: UpdateHabitInput): Promise<HabitResponse> {
    const existing = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!existing) {
      throw new Error('Không tìm thấy thói quen');
    }

    const title = input.name || input.title;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.targetFrequency !== undefined) updateData.targetFrequency = input.targetFrequency;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.icon !== undefined) updateData.icon = input.icon;

    const updated = await prisma.habit.update({
      where: { id: habitId },
      data: updateData,
      include: {
        logs: true,
      },
    });

    return formatHabit(updated);
  }

  /**
   * Delete habit
   */
  static async deleteHabit(userId: string, habitId: string): Promise<void> {
    const existing = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!existing) {
      throw new Error('Không tìm thấy thói quen');
    }

    await prisma.habit.delete({
      where: { id: habitId },
    });
  }

  /**
   * Habit Check-in for a given calendar date (default today)
   */
  static async checkIn(userId: string, habitId: string, input?: CheckInInput): Promise<HabitResponse> {
    const todayStr = normalizeDateString();
    const targetDateStr = input?.date ? input.date : todayStr;

    if (targetDateStr > todayStr) {
      throw new Error('Không thể đánh dấu hoàn thành cho ngày trong tương lai');
    }

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
      include: { logs: true },
    });

    if (!habit) {
      throw new Error('Không tìm thấy thói quen');
    }

    const targetUtcDate = parseDateToUtc(targetDateStr);

    return await prisma.$transaction(async (tx) => {
      // Upsert log idempotently
      await tx.habitLog.upsert({
        where: {
          habitId_completedDate: {
            habitId,
            completedDate: targetUtcDate,
          },
        },
        create: {
          habitId,
          completedDate: targetUtcDate,
          isCompleted: true,
        },
        update: {
          isCompleted: true,
        },
      });

      // Recalculate streaks from all logs
      const allLogs = await tx.habitLog.findMany({
        where: { habitId, isCompleted: true },
      });

      const streakData = calculateStreaksFromLogs(allLogs, todayStr);

      const updatedHabit = await tx.habit.update({
        where: { id: habitId },
        data: {
          currentStreak: streakData.currentStreak,
          bestStreak: Math.max(habit.bestStreak, streakData.bestStreak),
          lastCompletedDate: streakData.lastCompletedDateStr ? parseDateToUtc(streakData.lastCompletedDateStr) : null,
          isCompletedToday: streakData.isCompletedToday,
        },
        include: {
          logs: true,
        },
      });

      return formatHabit(updatedHabit, todayStr);
    });
  }

  /**
   * Undo check-in for a given calendar date (default today)
   */
  static async undoCheckIn(userId: string, habitId: string, dateStr?: string): Promise<HabitResponse> {
    const todayStr = normalizeDateString();
    const targetDateStr = dateStr || todayStr;

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
      include: { logs: true },
    });

    if (!habit) {
      throw new Error('Không tìm thấy thói quen');
    }

    const targetUtcDate = parseDateToUtc(targetDateStr);

    return await prisma.$transaction(async (tx) => {
      await tx.habitLog.deleteMany({
        where: {
          habitId,
          completedDate: targetUtcDate,
        },
      });

      const allLogs = await tx.habitLog.findMany({
        where: { habitId, isCompleted: true },
      });

      const streakData = calculateStreaksFromLogs(allLogs, todayStr);

      const updatedHabit = await tx.habit.update({
        where: { id: habitId },
        data: {
          currentStreak: streakData.currentStreak,
          bestStreak: streakData.bestStreak,
          lastCompletedDate: streakData.lastCompletedDateStr ? parseDateToUtc(streakData.lastCompletedDateStr) : null,
          isCompletedToday: streakData.isCompletedToday,
        },
        include: {
          logs: true,
        },
      });

      return formatHabit(updatedHabit, todayStr);
    });
  }

  /**
   * Get habit completion history
   */
  static async getHabitHistory(
    userId: string,
    habitId: string,
    query: HabitHistoryQuery
  ): Promise<HabitHistoryResponse> {
    const todayStr = normalizeDateString();
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
      include: { logs: true },
    });

    if (!habit) {
      throw new Error('Không tìm thấy thói quen');
    }

    const { start, end, page = 1, limit = 30 } = query;

    const where: any = { habitId, isCompleted: true };
    if (start || end) {
      where.completedDate = {};
      if (start) where.completedDate.gte = parseDateToUtc(start);
      if (end) where.completedDate.lte = parseDateToUtc(end);
    }

    const total = await prisma.habitLog.count({ where });

    const rawLogs = await prisma.habitLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { completedDate: 'desc' },
    });

    const logs = rawLogs.map((l) => ({
      id: l.id,
      habitId: l.habitId,
      date: normalizeDateString(l.completedDate),
      completed: l.isCompleted,
      notes: l.notes,
      createdAt: l.createdAt,
    }));

    const streakData = calculateStreaksFromLogs(habit.logs, todayStr);

    return {
      logs,
      summary: {
        completedDays: total,
        currentStreak: streakData.currentStreak,
        bestStreak: Math.max(habit.bestStreak, streakData.bestStreak),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get weekly summary for habit
   */
  static async getWeeklySummary(
    userId: string,
    habitId: string,
    dateStr?: string
  ): Promise<HabitWeeklySummaryResponse> {
    const targetDateStr = dateStr || normalizeDateString();
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      throw new Error('Không tìm thấy thói quen');
    }

    // Calculate Monday of target week
    const targetDate = parseDateToUtc(targetDateStr);
    const dayOfWeek = (targetDate.getUTCDay() + 6) % 7; // Monday = 0, ..., Sunday = 6
    const mondayDate = new Date(targetDate);
    mondayDate.setUTCDate(mondayDate.getUTCDate() - dayOfWeek);

    const weekStartStr = normalizeDateString(mondayDate);
    const weekEndStr = getOffsetDateString(weekStartStr, 6);

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId,
        isCompleted: true,
        completedDate: {
          gte: parseDateToUtc(weekStartStr),
          lte: parseDateToUtc(weekEndStr),
        },
      },
    });

    const completedDatesSet = new Set(logs.map((l) => normalizeDateString(l.completedDate)));

    const days = DAY_NAMES.map((dayName, idx) => {
      const dStr = getOffsetDateString(weekStartStr, idx);
      return {
        date: dStr,
        dayName,
        dayOfWeek: idx,
        completed: completedDatesSet.has(dStr),
      };
    });

    const completedDays = days.filter((d) => d.completed).length;

    return {
      habitId,
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      targetFrequency: habit.targetFrequency,
      completedDays,
      goalReached: completedDays >= habit.targetFrequency,
      days,
    };
  }

  /**
   * Get today's habits with summary statistics
   */
  static async getTodayHabits(userId: string): Promise<TodayHabitsResponse> {
    const todayStr = normalizeDateString();

    const rawHabits = await prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
      orderBy: { createdAt: 'desc' },
    });

    const habits = rawHabits.map((h) => formatHabit(h, todayStr));
    const total = habits.length;
    const completed = habits.filter((h) => h.isCompletedToday).length;
    const remaining = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      date: todayStr,
      habits,
      summary: {
        total,
        completed,
        remaining,
        completionRate,
      },
    };
  }
}
