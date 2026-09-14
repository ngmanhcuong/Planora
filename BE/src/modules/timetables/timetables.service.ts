import { prisma } from '../../config/prisma';
import { ClassType } from '@prisma/client';
import {
  CreateTimetableInput,
  UpdateTimetableInput,
  CreateTimetableItemInput,
  UpdateTimetableItemInput,
} from './timetables.schemas';
import {
  TimetableResponse,
  TimetableItemResponse,
  TimetableListQuery,
  PaginatedTimetablesResponse,
  TimetableConflictQuery,
  TimetableConflictResponse,
  WeeklyTimetableResponse,
} from './timetables.types';

const DAY_NAMES = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
];

function mapClassType(typeInput?: string): ClassType {
  if (!typeInput) return ClassType.THEORY;
  if (typeInput === 'LECTURE') return ClassType.THEORY;
  if (typeInput === 'LAB') return ClassType.PRACTICE;
  if (typeInput === 'PRACTICE') return ClassType.PRACTICE;
  if (typeInput === 'EXAM') return ClassType.EXAM;
  return ClassType.THEORY;
}

function formatItem(item: any): TimetableItemResponse {
  return {
    id: item.id,
    timetableId: item.timetableId,
    courseName: item.subjectName,
    subjectName: item.subjectName,
    courseCode: item.courseCode || '',
    dayOfWeek: item.dayOfWeek,
    startSlot: item.startSlot,
    slotSpan: item.slotSpan,
    startTime: item.startTime,
    endTime: item.endTime,
    timeRange: item.timeRange || `${item.startTime} - ${item.endTime}`,
    room: item.room || '',
    lecturer: item.lecturer || '',
    classType: item.type,
    type: item.type,
    color: item.color,
    bgColor: item.bgColor,
    textColor: item.textColor,
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function formatTimetable(timetable: any): TimetableResponse {
  return {
    id: timetable.id,
    userId: timetable.userId,
    name: timetable.termName,
    termName: timetable.termName,
    academicYear: timetable.academicYear,
    totalCredits: timetable.totalCredits,
    totalSubjects: timetable.totalSubjects,
    isActive: timetable.isCurrent,
    isCurrent: timetable.isCurrent,
    createdAt: timetable.createdAt,
    updatedAt: timetable.updatedAt,
    items: timetable.items ? timetable.items.map(formatItem) : undefined,
  };
}

export class TimetablesService {
  /**
   * Create new timetable
   */
  static async createTimetable(userId: string, input: CreateTimetableInput): Promise<TimetableResponse> {
    const termName = input.name || input.termName || 'Học kỳ 1 - 2026';
    const isActive = input.isActive ?? input.isCurrent ?? false;

    // Check if user has any timetables yet
    const existingCount = await prisma.timetable.count({ where: { userId } });
    const shouldBeActive = isActive || existingCount === 0;

    return await prisma.$transaction(async (tx) => {
      if (shouldBeActive) {
        await tx.timetable.updateMany({
          where: { userId },
          data: { isCurrent: false },
        });
      }

      const timetable = await tx.timetable.create({
        data: {
          userId,
          termName,
          academicYear: input.academicYear || '2025-2026',
          isCurrent: shouldBeActive,
        },
        include: {
          items: true,
        },
      });

      return formatTimetable(timetable);
    });
  }

  /**
   * List timetables for user
   */
  static async listTimetables(userId: string, query: TimetableListQuery): Promise<PaginatedTimetablesResponse> {
    const { page = 1, limit = 10, search, isActive, isCurrent } = query;
    const filterActive = isActive ?? isCurrent;

    const where: any = { userId };

    if (filterActive !== undefined) {
      where.isCurrent = filterActive;
    }

    if (search && search.trim()) {
      where.termName = { contains: search.trim() };
    }

    const total = await prisma.timetable.count({ where });

    const timetables = await prisma.timetable.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isCurrent: 'desc' }, { createdAt: 'desc' }],
      include: {
        items: true,
      },
    });

    return {
      timetables: timetables.map(formatTimetable),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get timetable by ID
   */
  static async getTimetableById(userId: string, timetableId: string): Promise<TimetableResponse> {
    const timetable = await prisma.timetable.findFirst({
      where: {
        id: timetableId,
        userId,
      },
      include: {
        items: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!timetable) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    return formatTimetable(timetable);
  }

  /**
   * Update timetable
   */
  static async updateTimetable(userId: string, timetableId: string, input: UpdateTimetableInput): Promise<TimetableResponse> {
    const existing = await prisma.timetable.findFirst({
      where: { id: timetableId, userId },
    });

    if (!existing) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    const termName = input.name || input.termName;
    const isActive = input.isActive ?? input.isCurrent;

    return await prisma.$transaction(async (tx) => {
      if (isActive === true) {
        await tx.timetable.updateMany({
          where: { userId, id: { not: timetableId } },
          data: { isCurrent: false },
        });
      }

      const updateData: any = {};
      if (termName) updateData.termName = termName;
      if (input.academicYear) updateData.academicYear = input.academicYear;
      if (isActive !== undefined) updateData.isCurrent = isActive;

      const updated = await tx.timetable.update({
        where: { id: timetableId },
        data: updateData,
        include: {
          items: true,
        },
      });

      return formatTimetable(updated);
    });
  }

  /**
   * Delete timetable
   */
  static async deleteTimetable(userId: string, timetableId: string): Promise<void> {
    const existing = await prisma.timetable.findFirst({
      where: { id: timetableId, userId },
    });

    if (!existing) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    await prisma.timetable.delete({
      where: { id: timetableId },
    });
  }

  /**
   * Create timetable item
   */
  static async createTimetableItem(
    userId: string,
    timetableId: string,
    input: CreateTimetableItemInput
  ): Promise<TimetableItemResponse> {
    const timetable = await prisma.timetable.findFirst({
      where: { id: timetableId, userId },
    });

    if (!timetable) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    const subjectName = input.courseName || input.subjectName || 'Môn học mới';
    const classType = mapClassType(input.classType || input.type);

    const item = await prisma.timetableItem.create({
      data: {
        timetableId,
        subjectName,
        courseCode: input.courseCode || '',
        dayOfWeek: input.dayOfWeek,
        startSlot: 1,
        slotSpan: 1,
        startTime: input.startTime,
        endTime: input.endTime,
        timeRange: `${input.startTime} - ${input.endTime}`,
        room: input.room || '',
        lecturer: input.lecturer || '',
        type: classType,
        color: input.color || '#0058BE',
        bgColor: input.bgColor || '#D8E2FF',
        textColor: input.textColor || '#001A42',
        notes: input.notes || null,
      },
    });

    // Update totalSubjects count on parent timetable
    const totalSubjects = await prisma.timetableItem.count({ where: { timetableId } });
    await prisma.timetable.update({
      where: { id: timetableId },
      data: { totalSubjects },
    });

    return formatItem(item);
  }

  /**
   * List timetable items sorted by dayOfWeek and startTime
   */
  static async listTimetableItems(userId: string, timetableId: string): Promise<TimetableItemResponse[]> {
    const timetable = await prisma.timetable.findFirst({
      where: { id: timetableId, userId },
    });

    if (!timetable) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    const items = await prisma.timetableItem.findMany({
      where: { timetableId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return items.map(formatItem);
  }

  /**
   * Get single timetable item by ID
   */
  static async getTimetableItemById(
    userId: string,
    timetableId: string,
    itemId: string
  ): Promise<TimetableItemResponse> {
    const timetable = await prisma.timetable.findFirst({
      where: { id: timetableId, userId },
    });

    if (!timetable) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    const item = await prisma.timetableItem.findFirst({
      where: { id: itemId, timetableId },
    });

    if (!item) {
      throw new Error('Không tìm thấy tiết học');
    }

    return formatItem(item);
  }

  /**
   * Update timetable item
   */
  static async updateTimetableItem(
    userId: string,
    timetableId: string,
    itemId: string,
    input: UpdateTimetableItemInput
  ): Promise<TimetableItemResponse> {
    const timetable = await prisma.timetable.findFirst({
      where: { id: timetableId, userId },
    });

    if (!timetable) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    const existingItem = await prisma.timetableItem.findFirst({
      where: { id: itemId, timetableId },
    });

    if (!existingItem) {
      throw new Error('Không tìm thấy tiết học');
    }

    const newStart = input.startTime || existingItem.startTime;
    const newEnd = input.endTime || existingItem.endTime;

    if (newEnd <= newStart) {
      throw new Error('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
    }

    const updateData: any = {};
    if (input.courseName || input.subjectName) {
      updateData.subjectName = input.courseName || input.subjectName;
    }
    if (input.courseCode !== undefined) updateData.courseCode = input.courseCode;
    if (input.dayOfWeek !== undefined) updateData.dayOfWeek = input.dayOfWeek;
    if (input.startTime !== undefined) updateData.startTime = newStart;
    if (input.endTime !== undefined) updateData.endTime = newEnd;
    updateData.timeRange = `${newStart} - ${newEnd}`;
    if (input.room !== undefined) updateData.room = input.room;
    if (input.lecturer !== undefined) updateData.lecturer = input.lecturer;
    if (input.classType || input.type) {
      updateData.type = mapClassType(input.classType || input.type);
    }
    if (input.color !== undefined) updateData.color = input.color;
    if (input.bgColor !== undefined) updateData.bgColor = input.bgColor;
    if (input.textColor !== undefined) updateData.textColor = input.textColor;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const updated = await prisma.timetableItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return formatItem(updated);
  }

  /**
   * Delete timetable item
   */
  static async deleteTimetableItem(userId: string, timetableId: string, itemId: string): Promise<void> {
    const timetable = await prisma.timetable.findFirst({
      where: { id: timetableId, userId },
    });

    if (!timetable) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    const existingItem = await prisma.timetableItem.findFirst({
      where: { id: itemId, timetableId },
    });

    if (!existingItem) {
      throw new Error('Không tìm thấy tiết học');
    }

    await prisma.timetableItem.delete({
      where: { id: itemId },
    });

    const totalSubjects = await prisma.timetableItem.count({ where: { timetableId } });
    await prisma.timetable.update({
      where: { id: timetableId },
      data: { totalSubjects },
    });
  }

  /**
   * Conflict check for timetable items
   */
  static async checkConflicts(
    userId: string,
    timetableId: string,
    query: TimetableConflictQuery
  ): Promise<TimetableConflictResponse> {
    const timetable = await prisma.timetable.findFirst({
      where: { id: timetableId, userId },
    });

    if (!timetable) {
      throw new Error('Không tìm thấy thời khóa biểu');
    }

    const items = await prisma.timetableItem.findMany({
      where: {
        timetableId,
        dayOfWeek: query.dayOfWeek,
        id: query.excludeItemId ? { not: query.excludeItemId } : undefined,
      },
    });

    const conflicting = items.filter((item) => {
      // Overlap rule: existing.startTime < proposedEndTime AND existing.endTime > proposedStartTime
      return item.startTime < query.endTime && item.endTime > query.startTime;
    });

    return {
      hasConflict: conflicting.length > 0,
      conflicts: conflicting.map((c) => ({
        id: c.id,
        courseName: c.subjectName,
        subjectName: c.subjectName,
        dayOfWeek: c.dayOfWeek,
        startTime: c.startTime,
        endTime: c.endTime,
        room: c.room,
      })),
    };
  }

  /**
   * Weekly timetable representation endpoint (/api/timetable/week)
   */
  static async getWeeklyTimetable(userId: string): Promise<WeeklyTimetableResponse> {
    // Find active timetable for user
    const activeTimetable = await prisma.timetable.findFirst({
      where: { userId, isCurrent: true },
      include: {
        items: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!activeTimetable) {
      return {
        timetable: null,
        days: DAY_NAMES.map((name, idx) => ({
          dayOfWeek: idx,
          dayName: name,
          items: [],
        })),
      };
    }

    const formattedTimetable = formatTimetable(activeTimetable);
    const items = activeTimetable.items.map(formatItem);

    const days = DAY_NAMES.map((name, idx) => {
      const dayItems = items.filter((item) => item.dayOfWeek === idx);
      return {
        dayOfWeek: idx,
        dayName: name,
        items: dayItems,
      };
    });

    return {
      timetable: formattedTimetable,
      days,
    };
  }
}
