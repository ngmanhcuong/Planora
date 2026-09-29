import { prisma } from '../../config/prisma';
import { NotificationType, TaskStatus } from '@prisma/client';
import {
  NotificationResponse,
  NotificationListQuery,
  PaginatedNotificationsResponse,
  CreateNotificationInput,
} from './notifications.types';
import { isDeliverableEmailAddress, sendScheduleReminderEmail } from '../../utils/mailer';

function formatNotification(n: any): NotificationResponse {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
    isRead: n.isRead,
    readAt: n.readAt,
    emailSentAt: n.emailSentAt,
    link: n.link,
    createdAt: n.createdAt,
  };
}

function mapTypeString(typeStr?: string): NotificationType | undefined {
  if (!typeStr) return undefined;
  const upper = typeStr.toUpperCase();
  if (upper === 'TASK_REMINDER' || upper === 'TASK_OVERDUE' || upper === 'DEADLINE') return NotificationType.DEADLINE;
  if (upper === 'EVENT_REMINDER' || upper === 'EVENT_CONFLICT' || upper === 'EVENT') return NotificationType.EVENT;
  if (upper === 'TIMETABLE_REMINDER' || upper === 'TIMETABLE') return NotificationType.TIMETABLE;
  if (upper === 'HABIT_REMINDER' || upper === 'HABIT') return NotificationType.HABIT;
  if (upper === 'SYSTEM') return NotificationType.SYSTEM;
  return undefined;
}

function getTaskDueAt(task: { dueDate: Date; dueTime?: string | null }): Date {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(task.dueDate);
  const datePart = Object.fromEntries(dateParts.map((part) => [part.type, part.value]));
  const dueTime = /^(\d{1,2}):(\d{2})$/.test(task.dueTime || '') ? task.dueTime : '23:59';
  return new Date(`${datePart.year}-${datePart.month}-${datePart.day}T${dueTime}:00+07:00`);
}

export class NotificationsService {
  private static pendingGeneration = new Map<string, Promise<{ createdCount: number }>>();
  private static allUsersGeneration: Promise<void> | null = null;
  /**
   * Internal method to create a notification with duplicate prevention
   */
  static async createNotification(
    input: CreateNotificationInput
  ): Promise<{ notification: NotificationResponse; isNew: boolean }> {
    // Duplicate prevention lookup
    const existing = await prisma.notification.findFirst({
      where: {
        userId: input.userId,
        type: input.type,
        relatedEntityType: input.relatedEntityType || null,
        relatedEntityId: input.relatedEntityId || null,
        title: input.title,
      },
    });

    if (existing) {
      return { notification: formatNotification(existing), isNew: false };
    }

    const created = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntityType: input.relatedEntityType || null,
        relatedEntityId: input.relatedEntityId || null,
        link: input.link || null,
      },
    });

    return { notification: formatNotification(created), isNew: true };
  }

  /**
   * List user notifications with filtering, search, pagination, and sorting
   */
  static async listNotifications(
    userId: string,
    query: NotificationListQuery
  ): Promise<PaginatedNotificationsResponse> {
    const { page = 1, limit = 20, isRead, type, search, sortOrder = 'desc' } = query;

    const where: any = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const mappedType = mapTypeString(type);
    if (mappedType) {
      where.type = mappedType;
    }

    if (search && search.trim()) {
      const keyword = search.trim();
      where.OR = [
        { title: { contains: keyword } },
        { message: { contains: keyword } },
      ];
    }

    const total = await prisma.notification.count({ where });

    const rawNotifications = await prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: sortOrder },
    });

    return {
      notifications: rawNotifications.map(formatNotification),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount };
  }

  /**
   * Get notification by ID
   */
  static async getNotificationById(userId: string, notificationId: string): Promise<NotificationResponse> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Không tìm thấy thông báo');
    }

    return formatNotification(notification);
  }

  /**
   * Mark single notification as read (idempotent)
   */
  static async markAsRead(userId: string, notificationId: string): Promise<NotificationResponse> {
    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      throw new Error('Không tìm thấy thông báo');
    }

    if (existing.isRead) {
      return formatNotification(existing);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return formatNotification(updated);
  }

  /**
   * Mark single notification as unread
   */
  static async markAsUnread(userId: string, notificationId: string): Promise<NotificationResponse> {
    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      throw new Error('Không tìm thấy thông báo');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: false,
        readAt: null,
      },
    });

    return formatNotification(updated);
  }

  /**
   * Mark all unread notifications as read for user
   */
  static async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { updatedCount: result.count };
  }

  /**
   * Delete single notification by ID
   */
  static async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      throw new Error('Không tìm thấy thông báo');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Clear all read notifications for user
   */
  static async clearReadNotifications(userId: string): Promise<{ deletedCount: number }> {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return { deletedCount: result.count };
  }

  /**
   * Manual reminder generation for testing / background triggers
   */
  static async generateDueNotifications(userId: string): Promise<{ createdCount: number }> {
    const pending = this.pendingGeneration.get(userId);
    if (pending) return pending;
    const work = this.generateReminders(userId).finally(() => this.pendingGeneration.delete(userId));
    this.pendingGeneration.set(userId, work);
    return work;
  }

  static async generateDueNotificationsForAllUsers(): Promise<void> {
    if (this.allUsersGeneration) return this.allUsersGeneration;

    this.allUsersGeneration = (async () => {
      const users = await prisma.user.findMany({ select: { id: true } });
      for (const user of users) {
        try {
          await this.generateDueNotifications(user.id);
        } catch (error) {
          console.error('[Reminder scheduler] User generation failed:', user.id, error instanceof Error ? error.message : error);
        }
      }
    })().finally(() => {
      this.allUsersGeneration = null;
    });

    return this.allUsersGeneration;
  }

  private static async generateReminders(userId: string): Promise<{ createdCount: number }> {
    const now = new Date();

    // 1. Fetch user settings for deadlineReminderHours
    const [setting, user] = await Promise.all([
      prisma.userSetting.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    ]);
    const reminderHours = setting?.deadlineReminderHours ?? 24;
    const reminderThreshold = new Date(now.getTime() + reminderHours * 3600 * 1000);
    const sendEmail = async (notificationId: string, emailSentAt: Date | null, item: { title: string; kind: 'Công việc' | 'Lịch trình'; scheduledAt: Date; isOverdue?: boolean }) => {
      if (
        emailSentAt
        || !setting?.emailNotifications
        || !user?.email
        || !isDeliverableEmailAddress(user.email)
      ) return;
      try {
        await sendScheduleReminderEmail(user.email, item);
        await prisma.notification.update({
          where: { id: notificationId },
          data: { emailSentAt: new Date() },
        });
      } catch (error) {
        console.error('[Schedule reminder email] Failed:', error instanceof Error ? error.message : error);
      }
    };

    let createdCount = 0;

    // 2. Task Reminders & Overdue
    const incompleteTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { not: TaskStatus.COMPLETED },
      },
    });

    for (const task of incompleteTasks) {
      const dueAt = getTaskDueAt(task);

      if (dueAt < now) {
        // Task Overdue
        const result = await NotificationsService.createNotification({
          userId,
          type: NotificationType.DEADLINE,
          title: 'Công việc quá hạn',
          message: `Công việc "${task.title}" đã quá hạn`,
          relatedEntityType: 'TASK',
          relatedEntityId: task.id,
          link: '/tasks',
        });
        if (result.isNew) createdCount++;
        await sendEmail(result.notification.id, result.notification.emailSentAt, { title: task.title, kind: 'Công việc', scheduledAt: dueAt, isOverdue: true });
      } else if (dueAt <= reminderThreshold) {
        // Task Reminder
        const result = await NotificationsService.createNotification({
          userId,
          type: NotificationType.DEADLINE,
          title: 'Nhắc nhở công việc sắp tới hạn',
          message: `Công việc "${task.title}" sắp đến hạn`,
          relatedEntityType: 'TASK',
          relatedEntityId: task.id,
          link: '/tasks',
        });
        if (result.isNew) createdCount++;
        await sendEmail(result.notification.id, result.notification.emailSentAt, { title: task.title, kind: 'Công việc', scheduledAt: dueAt });
      }
    }

    // 3. Event Reminders & Conflicts
    const upcomingEvents = await prisma.event.findMany({
      where: {
        userId,
        startTime: {
          gte: now,
          lte: reminderThreshold,
        },
      },
    });

    for (const evt of upcomingEvents) {
      const result = await NotificationsService.createNotification({
        userId,
        type: NotificationType.EVENT,
        title: 'Nhắc nhở sự kiện sắp diễn ra',
        message: `Sự kiện "${evt.title}" sắp diễn ra`,
        relatedEntityType: 'EVENT',
        relatedEntityId: evt.id,
        link: '/calendar',
      });
      if (result.isNew) createdCount++;
      await sendEmail(result.notification.id, result.notification.emailSentAt, { title: evt.title, kind: 'Lịch trình', scheduledAt: evt.startTime });

      if (evt.hasConflict) {
        const conflictRes = await NotificationsService.createNotification({
          userId,
          type: NotificationType.EVENT,
          title: 'Cảnh báo xung đột sự kiện',
          message: `Sự kiện "${evt.title}" bị trùng lịch`,
          relatedEntityType: 'EVENT',
          relatedEntityId: evt.id,
          link: '/calendar',
        });
        if (conflictRes.isNew) createdCount++;
      }
    }

    return { createdCount };
  }
}
