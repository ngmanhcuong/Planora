import { prisma } from '../../config/prisma';
import { TaskStatus } from '@prisma/client';
import {
  DashboardResponse,
  WeeklyStatisticsResponse,
  MonthlyStatisticsResponse,
  DashboardTaskItem,
  DashboardEventItem,
  DashboardTimetableItem,
  DashboardHabitItem,
} from './dashboard.types';
import { calculateStreaksFromLogs, normalizeDateString, parseDateToUtc, getOffsetDateString } from '../habits/habits.service';
import { expandRecurringEvents } from '../events/events.service';

const DAY_NAMES = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

function getTodayBounds() {
  const now = new Date();
  const todayStr = normalizeDateString(now);
  const startOfToday = parseDateToUtc(todayStr);
  const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);

  // Current day of week (Monday = 0 ... Sunday = 6)
  const currentDayOfWeek = (now.getDay() + 6) % 7;

  return { now, todayStr, startOfToday, endOfToday, currentDayOfWeek };
}

function calculateProductivityScore(
  tasksDue: number,
  tasksCompleted: number,
  totalHabits: number,
  habitsCompleted: number
): number {
  const taskRate = tasksDue > 0 ? Math.min(1, Math.max(0, tasksCompleted / tasksDue)) : null;
  const habitRate = totalHabits > 0 ? Math.min(1, Math.max(0, habitsCompleted / totalHabits)) : null;

  if (taskRate !== null && habitRate !== null) {
    return Math.round((taskRate * 0.6 + habitRate * 0.4) * 100);
  }
  if (taskRate !== null) {
    return Math.round(taskRate * 100);
  }
  if (habitRate !== null) {
    return Math.round(habitRate * 100);
  }
  return 0;
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours = '0', minutes = '0'] = time.split(':');
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number(hours),
    Number(minutes),
    0,
    0
  );
}

function countTimetableOccurrences(items: any[], rangeStart: Date, rangeEnd: Date): number {
  let count = 0;
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);

  while (cursor < rangeEnd) {
    const dayOfWeek = (cursor.getDay() + 6) % 7;

    for (const item of items) {
      if (item.dayOfWeek !== dayOfWeek) continue;

      const start = combineDateAndTime(cursor, item.startTime);
      const end = combineDateAndTime(cursor, item.endTime);

      if (start < rangeEnd && end > rangeStart) {
        count++;
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

export class DashboardService {
  /**
   * Main aggregated dashboard endpoint (/api/dashboard)
   */
  static async getDashboard(userId: string): Promise<DashboardResponse> {
    const { now, todayStr, startOfToday, endOfToday, currentDayOfWeek } = getTodayBounds();
    const next7DaysEnd = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

    // Parallel fetch all dashboard modules efficiently
    const [
      tasksTodayRaw,
      tasksOverdueRaw,
      eventsUpcomingRaw,
      activeTimetable,
      habitsRaw,
      recentNotificationsRaw,
      unreadNotificationsCount,
    ] = await Promise.all([
      // Tasks due today
      prisma.task.findMany({
        where: {
          userId,
          dueDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        include: { category: true },
        orderBy: { dueDate: 'asc' },
      }),

      // Overdue tasks (limit 5)
      prisma.task.findMany({
        where: {
          userId,
          dueDate: { lt: now },
          status: { not: TaskStatus.COMPLETED },
        },
        take: 5,
        include: { category: true },
        orderBy: { dueDate: 'asc' },
      }),

      // Upcoming events next 7 days (limit 5)
      prisma.event.findMany({
        where: {
          userId,
          OR: [
            {
              startTime: {
                gte: now,
                lte: next7DaysEnd,
              },
            },
            {
              recurrenceType: { not: 'NONE' },
            },
          ],
        },
        include: { category: true },
        orderBy: { startTime: 'asc' },
      }),

      // Active timetable today items
      prisma.timetable.findFirst({
        where: { userId, isCurrent: true },
        include: {
          items: {
            orderBy: { startTime: 'asc' },
          },
        },
      }),

      // User habits + logs
      prisma.habit.findMany({
        where: { userId },
        include: { logs: true },
        orderBy: { createdAt: 'desc' },
      }),

      // Recent notifications (limit 5)
      prisma.notification.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),

      // Unread notifications count
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    // 1. Process Tasks
    const formatTask = (t: any): DashboardTaskItem => {
      const isOverdue = t.status !== TaskStatus.COMPLETED && t.dueDate < now;
      return {
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        dueTime: t.dueTime,
        courseCode: t.courseCode,
        category: t.category,
        isOverdue,
        displayStatus: isOverdue ? 'OVERDUE' : t.status,
      };
    };

    const todayTasks = tasksTodayRaw.map(formatTask);
    const overdueTasks = tasksOverdueRaw.map(formatTask);

    const tasksTodayCount = todayTasks.length;
    const tasksCompletedTodayCount = todayTasks.filter(
      (t) => t.status === TaskStatus.COMPLETED || (t.dueDate >= startOfToday && t.dueDate <= endOfToday && t.status === TaskStatus.COMPLETED)
    ).length;
    const overdueTasksCount = overdueTasks.length;

    // 2. Process Events
    const expandedEvents = expandRecurringEvents(eventsUpcomingRaw, now, next7DaysEnd, 500);
    const upcomingEvents: DashboardEventItem[] = expandedEvents.slice(0, 5).map((e: any) => ({
      id: e.id,
      title: e.title,
      start: e.startAt || e.startTime,
      end: e.endAt || e.endTime,
      allDay: e.allDay ?? e.isAllDay ?? false,
      location: e.location,
      category: e.category,
    }));

    // 3. Process Timetable
    const activeTimetableItems = activeTimetable?.items || [];
    const todayTimetable: DashboardTimetableItem[] = activeTimetableItems
      .filter((i) => i.dayOfWeek === currentDayOfWeek)
      .map((i) => ({
          id: i.id,
          courseName: i.subjectName,
          subjectName: i.subjectName,
          courseCode: i.courseCode || '',
          startTime: i.startTime,
          endTime: i.endTime,
          room: i.room || '',
          lecturer: i.lecturer || '',
          type: i.type,
        }));
    const upcomingTimetableCount = countTimetableOccurrences(activeTimetableItems, now, next7DaysEnd);

    // 4. Process Habits
    const habitItems: DashboardHabitItem[] = habitsRaw.map((h) => {
      const streakData = calculateStreaksFromLogs(h.logs, todayStr);
      return {
        id: h.id,
        name: h.title,
        title: h.title,
        completedToday: streakData.isCompletedToday,
        isCompletedToday: streakData.isCompletedToday,
        currentStreak: streakData.currentStreak,
        bestStreak: Math.max(h.bestStreak, streakData.bestStreak),
        targetFrequency: h.targetFrequency,
        color: h.color,
        icon: h.icon,
      };
    });

    const totalHabits = habitItems.length;
    const habitsCompletedTodayCount = habitItems.filter((h) => h.isCompletedToday).length;
    const habitCompletionRate = totalHabits > 0 ? Math.round((habitsCompletedTodayCount / totalHabits) * 100) : 0;

    // 5. Productivity Score
    const todayScore = calculateProductivityScore(
      tasksTodayCount,
      tasksCompletedTodayCount,
      totalHabits,
      habitsCompletedTodayCount
    );

    return {
      summary: {
        tasksToday: tasksTodayCount,
        tasksCompletedToday: tasksCompletedTodayCount,
        overdueTasks: overdueTasksCount,
        upcomingEvents: upcomingEvents.length + upcomingTimetableCount,
        habitsCompletedToday: habitsCompletedTodayCount,
        totalHabits,
        unreadNotifications: unreadNotificationsCount,
      },
      tasks: {
        today: todayTasks,
        overdue: overdueTasks,
      },
      events: {
        upcoming: upcomingEvents,
      },
      timetable: {
        today: todayTimetable,
      },
      habits: {
        today: habitItems,
        completionRate: habitCompletionRate,
      },
      notifications: {
        unreadCount: unreadNotificationsCount,
        recent: recentNotificationsRaw as any,
      },
      productivity: {
        todayScore,
        weekScore: todayScore, // Default to todayScore or week average
      },
    };
  }

  /**
   * Weekly statistics report (/api/dashboard/statistics/weekly)
   */
  static async getWeeklyStatistics(userId: string, dateInput?: string): Promise<WeeklyStatisticsResponse> {
    const { now } = getTodayBounds();
    const targetDateStr = dateInput || normalizeDateString(now);
    const targetDate = parseDateToUtc(targetDateStr);

    const dayOfWeek = (targetDate.getUTCDay() + 6) % 7; // Monday = 0
    const mondayDate = new Date(targetDate);
    mondayDate.setUTCDate(mondayDate.getUTCDate() - dayOfWeek);

    const weekStartStr = normalizeDateString(mondayDate);
    const weekEndStr = getOffsetDateString(weekStartStr, 6);

    const weekStart = parseDateToUtc(weekStartStr);
    const weekEnd = new Date(`${weekEndStr}T23:59:59.999Z`);

    const [tasksInWeek, habitLogsInWeek, eventsInWeek, userHabits] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          OR: [
            { dueDate: { gte: weekStart, lte: weekEnd } },
            { completedAt: { gte: weekStart, lte: weekEnd } },
          ],
        },
      }),

      prisma.habitLog.findMany({
        where: {
          habit: { userId },
          isCompleted: true,
          completedDate: { gte: weekStart, lte: weekEnd },
        },
      }),

      prisma.event.findMany({
        where: {
          userId,
          startTime: { gte: weekStart, lte: weekEnd },
        },
      }),

      prisma.habit.findMany({
        where: { userId },
        select: { targetFrequency: true },
      }),
    ]);

    const tasksTotalCount = tasksInWeek.filter(
      (t) => t.dueDate >= weekStart && t.dueDate <= weekEnd
    ).length;

    const tasksCompletedCount = tasksInWeek.filter((t) => {
      if (t.completedAt) {
        return t.completedAt >= weekStart && t.completedAt <= weekEnd;
      }
      return t.status === TaskStatus.COMPLETED && t.dueDate >= weekStart && t.dueDate <= weekEnd;
    }).length;

    const taskCompletionRate = tasksTotalCount > 0 ? Math.round((tasksCompletedCount / tasksTotalCount) * 100) : 0;

    const habitCheckInsCount = habitLogsInWeek.length;
    const possibleHabitTarget = userHabits.reduce((acc, h) => acc + h.targetFrequency, 0);
    const habitCompletionRate = possibleHabitTarget > 0 ? Math.round((habitCheckInsCount / possibleHabitTarget) * 100) : 0;

    // Daily breakdown for 7 days (Monday..Sunday)
    let totalDailyScores = 0;

    const daily = DAY_NAMES.map((dayName, idx) => {
      const dStr = getOffsetDateString(weekStartStr, idx);
      const dStart = parseDateToUtc(dStr);
      const dEnd = new Date(`${dStr}T23:59:59.999Z`);

      const dayTasksDue = tasksInWeek.filter((t) => t.dueDate >= dStart && t.dueDate <= dEnd).length;
      const dayTasksCompleted = tasksInWeek.filter((t) => {
        if (t.completedAt) return t.completedAt >= dStart && t.completedAt <= dEnd;
        return t.status === TaskStatus.COMPLETED && t.dueDate >= dStart && t.dueDate <= dEnd;
      }).length;

      const dayHabitCheckIns = habitLogsInWeek.filter(
        (l) => normalizeDateString(l.completedDate) === dStr
      ).length;

      const dayEvents = eventsInWeek.filter(
        (e) => e.startTime >= dStart && e.startTime <= dEnd
      ).length;

      const dayScore = calculateProductivityScore(dayTasksDue, dayTasksCompleted, userHabits.length, dayHabitCheckIns);
      totalDailyScores += dayScore;

      return {
        date: dStr,
        dayName,
        dayOfWeek: idx,
        tasksCompleted: dayTasksCompleted,
        tasksTotal: dayTasksDue,
        habitCheckIns: dayHabitCheckIns,
        events: dayEvents,
      };
    });

    const weeklyProductivityScore = Math.round(totalDailyScores / 7);

    return {
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      tasks: {
        total: tasksTotalCount,
        completed: tasksCompletedCount,
        completionRate: taskCompletionRate,
      },
      habits: {
        totalCheckIns: habitCheckInsCount,
        possibleTarget: possibleHabitTarget,
        completionRate: habitCompletionRate,
      },
      events: {
        total: eventsInWeek.length,
      },
      daily,
      productivityScore: weeklyProductivityScore,
    };
  }

  /**
   * Monthly statistics report (/api/dashboard/statistics/monthly)
   */
  static async getMonthlyStatistics(userId: string, monthInput?: string): Promise<MonthlyStatisticsResponse> {
    const { now } = getTodayBounds();

    let year: number;
    let month: number;

    if (monthInput && /^\d{4}-\d{2}$/.test(monthInput)) {
      const parts = monthInput.split('-').map(Number);
      year = parts[0];
      month = parts[1];
    } else {
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
    const monthStartStr = `${formattedMonth}-01`;

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const lastDayOfMonth = new Date(Date.UTC(nextYear, nextMonth - 1, 0)).getUTCDate();
    const monthEndStr = `${formattedMonth}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const monthStart = parseDateToUtc(monthStartStr);
    const monthEnd = new Date(`${monthEndStr}T23:59:59.999Z`);

    const [tasksInMonth, habitLogsInMonth, eventsInMonth, totalHabitsCount] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          OR: [
            { dueDate: { gte: monthStart, lte: monthEnd } },
            { completedAt: { gte: monthStart, lte: monthEnd } },
          ],
        },
      }),

      prisma.habitLog.count({
        where: {
          habit: { userId },
          isCompleted: true,
          completedDate: { gte: monthStart, lte: monthEnd },
        },
      }),

      prisma.event.count({
        where: {
          userId,
          startTime: { gte: monthStart, lte: monthEnd },
        },
      }),

      prisma.habit.count({
        where: { userId },
      }),
    ]);

    const tasksTotal = tasksInMonth.filter((t) => t.dueDate >= monthStart && t.dueDate <= monthEnd).length;
    const tasksCompleted = tasksInMonth.filter((t) => {
      if (t.completedAt) return t.completedAt >= monthStart && t.completedAt <= monthEnd;
      return t.status === TaskStatus.COMPLETED && t.dueDate >= monthStart && t.dueDate <= monthEnd;
    }).length;

    const tasksOverdue = tasksInMonth.filter(
      (t) => t.dueDate >= monthStart && t.dueDate <= monthEnd && t.dueDate < now && t.status !== TaskStatus.COMPLETED
    ).length;

    const completionRate = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    const productivityScore = calculateProductivityScore(tasksTotal, tasksCompleted, totalHabitsCount, Math.min(totalHabitsCount * 30, habitLogsInMonth));

    return {
      month: formattedMonth,
      tasks: {
        total: tasksTotal,
        completed: tasksCompleted,
        overdue: tasksOverdue,
        completionRate,
      },
      habits: {
        checkIns: habitLogsInMonth,
      },
      events: {
        total: eventsInMonth,
      },
      productivityScore,
    };
  }
}
