import { prisma } from '../../config/prisma';
import { UserAiContext } from './ai.types';

export async function buildUserAiContext(userId: string): Promise<UserAiContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const now = new Date();

  // Incomplete tasks
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { not: 'COMPLETED' },
    },
    orderBy: { dueDate: 'asc' },
    take: 20,
    select: {
      id: true,
      title: true,
      priority: true,
      dueDate: true,
      dueTime: true,
      courseCode: true,
    },
  });

  const formattedTasks = tasks.map((t) => {
    const isOverdue = new Date(t.dueDate) < now;
    return {
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate.toISOString().split('T')[0],
      dueTime: t.dueTime,
      isOverdue,
      courseCode: t.courseCode,
    };
  });

  // Upcoming events (7 days ahead)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const events = await prisma.event.findMany({
    where: {
      userId,
      startTime: { gte: now, lte: nextWeek },
    },
    orderBy: { startTime: 'asc' },
    take: 15,
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      location: true,
    },
  });

  const formattedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    startAt: e.startTime.toISOString(),
    endAt: e.endTime.toISOString(),
    location: e.location,
  }));

  // Active timetable
  const currentTimetable = await prisma.timetable.findFirst({
    where: { userId, isCurrent: true },
    include: { items: true },
  });

  const formattedTimetable = (currentTimetable?.items || []).map((ti) => ({
    id: ti.id,
    subjectName: ti.subjectName,
    dayOfWeek: ti.dayOfWeek,
    startTime: ti.startTime,
    endTime: ti.endTime,
    room: ti.room,
  }));

  // Habits today
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      currentStreak: true,
      isCompletedToday: true,
    },
  });

  const formattedHabits = habits.map((h) => ({
    id: h.id,
    title: h.title,
    completedToday: h.isCompletedToday,
    currentStreak: h.currentStreak,
  }));

  // Productivity score calculated from today's persisted tasks and habits.
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const todayTasks = await prisma.task.findMany({
    where: { userId, dueDate: { gte: startOfToday, lte: endOfToday } },
    select: { status: true },
  });
  const completedTasks = todayTasks.filter((task) => task.status === 'COMPLETED').length;
  const completedHabits = formattedHabits.filter((habit) => habit.completedToday).length;
  const taskRate = todayTasks.length > 0 ? completedTasks / todayTasks.length : null;
  const habitRate = formattedHabits.length > 0 ? completedHabits / formattedHabits.length : null;
  const todayScore = taskRate !== null && habitRate !== null
    ? Math.round((taskRate * 0.6 + habitRate * 0.4) * 100)
    : taskRate !== null
      ? Math.round(taskRate * 100)
      : habitRate !== null
        ? Math.round(habitRate * 100)
        : 0;

  return {
    currentTimeIso: now.toISOString(),
    userName: user?.name || 'Người dùng',
    incompleteTasks: formattedTasks,
    upcomingEvents: formattedEvents,
    timetableItems: formattedTimetable,
    habitSummaries: formattedHabits,
    todayScore,
  };
}
