import { prisma } from '../../config/prisma';
import { RecurrenceType, TaskStatus } from '@prisma/client';
import { CreateEventInput, UpdateEventInput } from './events.schemas';
import {
  EventResponse,
  EventListQuery,
  PaginatedEventsResponse,
  ConflictCheckQuery,
  ConflictCheckResponse,
  CalendarRangeQuery,
  CalendarItemResponse,
} from './events.types';

/**
 * Format Prisma Event object to API response structure
 */
function formatEvent(event: any): EventResponse {
  return {
    id: event.id,
    userId: event.userId,
    categoryId: event.categoryId,
    category: event.category
      ? {
          id: event.category.id,
          name: event.category.name,
          type: event.category.type,
          color: event.category.color,
          bgColor: event.category.bgColor,
          textColor: event.category.textColor,
        }
      : null,
    title: event.title,
    description: event.description,
    location: event.location,
    startAt: event.startTime,
    endAt: event.endTime,
    allDay: event.isAllDay,
    hasConflict: event.hasConflict,
    recurrenceType: event.recurrenceType,
    recurrenceInterval: event.recurrenceInterval,
    recurrenceEndDate: event.recurrenceEndDate,
    color: event.color,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

/**
 * Validate category access for a user (Category must belong to user or be a system category)
 */
async function validateCategoryAccess(userId: string, categoryId?: string | null) {
  if (!categoryId) return;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category || (!category.isSystem && category.userId !== userId)) {
    throw new Error('Danh mục không hợp lệ hoặc không có quyền truy cập');
  }
}

/**
 * Generate recurring event occurrences within a given range
 */
export function expandRecurringEvents(
  events: any[],
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences = 500
): EventResponse[] {
  const result: EventResponse[] = [];
  let totalCount = 0;

  for (const event of events) {
    const formatted = formatEvent(event);

    if (event.recurrenceType === RecurrenceType.NONE) {
      result.push(formatted);
      totalCount++;
      continue;
    }

    const duration = event.endTime.getTime() - event.startTime.getTime();
    let currentStart = new Date(event.startTime);
    let currentEnd = new Date(event.endTime);
    const recEndDate = event.recurrenceEndDate
      ? new Date(Math.min(event.recurrenceEndDate.getTime(), rangeEnd.getTime()))
      : rangeEnd;

    const interval = Math.max(1, event.recurrenceInterval || 1);

    while (currentStart <= recEndDate && totalCount < maxOccurrences) {
      if (currentStart < rangeEnd && currentEnd > rangeStart) {
        result.push({
          ...formatted,
          id: currentStart.getTime() === event.startTime.getTime() ? event.id : `${event.id}_rec_${currentStart.getTime()}`,
          startAt: new Date(currentStart),
          endAt: new Date(currentEnd),
        });
        totalCount++;
      }

      if (event.recurrenceType === RecurrenceType.DAILY) {
        currentStart.setDate(currentStart.getDate() + interval);
      } else if (event.recurrenceType === RecurrenceType.WEEKLY) {
        currentStart.setDate(currentStart.getDate() + 7 * interval);
      } else if (event.recurrenceType === RecurrenceType.MONTHLY) {
        currentStart.setMonth(currentStart.getMonth() + interval);
      } else {
        break;
      }

      currentEnd = new Date(currentStart.getTime() + duration);

      if (currentStart > recEndDate) {
        break;
      }
    }
  }

  return result;
}

export class EventsService {
  /**
   * Create new event
   */
  static async createEvent(userId: string, input: CreateEventInput): Promise<EventResponse> {
    await validateCategoryAccess(userId, input.categoryId);

    const startTime = new Date(input.startAt);
    const endTime = new Date(input.endAt);

    // Check conflict advisory
    const conflictCount = await prisma.event.count({
      where: {
        userId,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    const event = await prisma.event.create({
      data: {
        userId,
        categoryId: input.categoryId || null,
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        startTime,
        endTime,
        isAllDay: input.allDay ?? false,
        hasConflict: conflictCount > 0,
        recurrenceType: input.recurrenceType ?? RecurrenceType.NONE,
        recurrenceInterval: input.recurrenceInterval ?? 1,
        recurrenceEndDate: input.recurrenceEndDate ? new Date(input.recurrenceEndDate) : null,
        color: input.color || '#4F46E5',
      },
      include: {
        category: true,
      },
    });

    return formatEvent(event);
  }

  /**
   * List user events with filtering, search, pagination, sorting
   */
  static async listEvents(userId: string, query: EventListQuery): Promise<PaginatedEventsResponse> {
    const { start, end, categoryId, search, page = 1, limit = 20, sortBy = 'startAt', sortOrder = 'asc' } = query;

    const where: any = { userId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search && search.trim()) {
      const searchKeyword = search.trim();
      where.OR = [
        { title: { contains: searchKeyword } },
        { description: { contains: searchKeyword } },
        { location: { contains: searchKeyword } },
      ];
    }

    let prismaSortBy = 'startTime';
    if (sortBy === 'endAt' || sortBy === 'endTime') prismaSortBy = 'endTime';
    else if (sortBy === 'createdAt') prismaSortBy = 'createdAt';
    else if (sortBy === 'updatedAt') prismaSortBy = 'updatedAt';
    else if (sortBy === 'title') prismaSortBy = 'title';

    if (start || end) {
      const rangeStart = start ? new Date(start) : new Date('1970-01-01');
      const rangeEnd = end ? new Date(end) : new Date('2099-12-31');

      where.OR = [
        ...(where.OR || []),
        {
          AND: [
            { startTime: { lt: rangeEnd } },
            { endTime: { gt: rangeStart } },
          ],
        },
        {
          recurrenceType: { not: RecurrenceType.NONE },
        },
      ];
    }

    const total = await prisma.event.count({ where });

    const rawEvents = await prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [prismaSortBy]: sortOrder },
      include: {
        category: true,
      },
    });

    let formattedEvents: EventResponse[];
    if (start && end) {
      formattedEvents = expandRecurringEvents(
        rawEvents,
        new Date(start),
        new Date(end),
        500
      );
    } else {
      formattedEvents = rawEvents.map(formatEvent);
    }

    return {
      events: formattedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get event by ID
   */
  static async getEventById(userId: string, eventId: string): Promise<EventResponse> {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!event) {
      throw new Error('Không tìm thấy sự kiện');
    }

    return formatEvent(event);
  }

  /**
   * Update event
   */
  static async updateEvent(userId: string, eventId: string, input: UpdateEventInput): Promise<EventResponse> {
    const existing = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Không tìm thấy sự kiện');
    }

    if (input.categoryId !== undefined) {
      await validateCategoryAccess(userId, input.categoryId);
    }

    const newStart = input.startAt ? new Date(input.startAt) : existing.startTime;
    const newEnd = input.endAt ? new Date(input.endAt) : existing.endTime;

    if (newEnd <= newStart) {
      throw new Error('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.startAt !== undefined) updateData.startTime = newStart;
    if (input.endAt !== undefined) updateData.endTime = newEnd;
    if (input.allDay !== undefined) updateData.isAllDay = input.allDay;
    if (input.recurrenceType !== undefined) updateData.recurrenceType = input.recurrenceType;
    if (input.recurrenceInterval !== undefined) updateData.recurrenceInterval = input.recurrenceInterval;
    if (input.recurrenceEndDate !== undefined) {
      updateData.recurrenceEndDate = input.recurrenceEndDate ? new Date(input.recurrenceEndDate) : null;
    }
    if (input.color !== undefined) updateData.color = input.color;

    // Check conflicts
    const conflictCount = await prisma.event.count({
      where: {
        userId,
        id: { not: eventId },
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
    });
    updateData.hasConflict = conflictCount > 0;

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        category: true,
      },
    });

    return formatEvent(updated);
  }

  /**
   * Delete event
   */
  static async deleteEvent(userId: string, eventId: string): Promise<void> {
    const existing = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Không tìm thấy sự kiện');
    }

    await prisma.event.delete({
      where: { id: eventId },
    });
  }

  /**
   * Advisory conflict check
   */
  static async checkConflicts(userId: string, query: ConflictCheckQuery): Promise<ConflictCheckResponse> {
    const proposedStart = new Date(query.startAt);
    const proposedEnd = new Date(query.endAt);

    const where: any = {
      userId,
      startTime: { lt: proposedEnd },
      endTime: { gt: proposedStart },
    };

    if (query.excludeEventId) {
      where.id = { not: query.excludeEventId };
    }

    const conflictingEvents = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
      },
    });

    return {
      hasConflict: conflictingEvents.length > 0,
      conflicts: conflictingEvents.map((e: { id: string; title: string; startTime: Date; endTime: Date }) => ({
        id: e.id,
        title: e.title,
        startAt: e.startTime,
        endAt: e.endTime,
      })),
    };
  }

  /**
   * Calendar range endpoint combining Events + Task deadlines
   */
  static async getCalendarRange(userId: string, query: CalendarRangeQuery): Promise<{ items: CalendarItemResponse[] }> {
    const rangeStart = new Date(query.start);
    const rangeEnd = new Date(query.end);
    const now = new Date();

    const rawEvents = await prisma.event.findMany({
      where: {
        userId,
        OR: [
          {
            AND: [
              { startTime: { lt: rangeEnd } },
              { endTime: { gt: rangeStart } },
            ],
          },
          {
            recurrenceType: { not: RecurrenceType.NONE },
          },
        ],
      },
      include: {
        category: true,
      },
    });

    const expandedEvents = expandRecurringEvents(rawEvents, rangeStart, rangeEnd, 500);

    const eventItems: CalendarItemResponse[] = expandedEvents.map((evt) => ({
      id: evt.id,
      sourceType: 'EVENT' as const,
      title: evt.title,
      start: evt.startAt,
      end: evt.endAt,
      allDay: evt.allDay,
      location: evt.location,
      category: evt.category,
      recurrenceType: evt.recurrenceType,
    }));

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
      include: {
        category: true,
      },
    });

    const taskItems: CalendarItemResponse[] = tasks.map((task: any) => {
      const isOverdue = task.status !== TaskStatus.COMPLETED && task.dueDate < now;
      let displayStatus = task.status;
      if (isOverdue) displayStatus = 'OVERDUE';

      return {
        id: task.id,
        sourceType: 'TASK' as const,
        title: task.title,
        start: task.dueDate,
        end: null,
        allDay: !task.dueTime,
        status: task.status,
        priority: task.priority,
        isOverdue,
        displayStatus,
        courseCode: task.courseCode,
        category: task.category
          ? {
              id: task.category.id,
              name: task.category.name,
              type: task.category.type,
              color: task.category.color,
              bgColor: task.category.bgColor,
              textColor: task.category.textColor,
            }
          : null,
      };
    });

    const items = [...eventItems, ...taskItems].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return { items };
  }
}
