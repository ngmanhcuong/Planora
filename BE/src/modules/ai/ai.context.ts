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

  return {
    currentTimeIso: now.toISOString(),
    userName: user?.name || 'Người dùng',
    incompleteTasks: formattedTasks,
    upcomingEvents: formattedEvents,
    timetableItems: formattedTimetable,
    habitSummaries: formattedHabits,
    todayScore: 75,
  };
}
