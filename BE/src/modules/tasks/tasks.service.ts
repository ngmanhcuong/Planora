import { TaskStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { CreateTaskInput, UpdateTaskInput } from './tasks.schemas';
import type { TaskResponse, TaskListQuery, PaginatedTasksResponse } from './tasks.types';

export class TasksService {
  private formatTaskResponse(task: any): TaskResponse {
    const now = new Date();
    const isOverdue = task.dueDate < now && task.status !== TaskStatus.COMPLETED;
    const displayStatus = isOverdue ? 'OVERDUE' : task.status;

    return {
      id: task.id,
      userId: task.userId,
      categoryId: task.categoryId,
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
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      courseCode: task.courseCode,
      subtasksCountTotal: task.subtasksCountTotal,
      subtasksCountCompleted: task.subtasksCountCompleted,
      completedAt: task.completedAt,
      isOverdue,
      displayStatus,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private async validateCategoryAccess(userId: string, categoryId: string): Promise<void> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Danh mục không tồn tại');
    }

    if (category.userId !== userId && !category.isSystem) {
      throw new Error('Bạn không có quyền truy cập vào danh mục này');
    }
  }

  async createTask(userId: string, input: CreateTaskInput): Promise<TaskResponse> {
    if (input.categoryId) {
      await this.validateCategoryAccess(userId, input.categoryId);
    }

    const task = await prisma.task.create({
      data: {
        userId,
        categoryId: input.categoryId || null,
        title: input.title,
        description: input.description || null,
        priority: input.priority,
        status: TaskStatus.TODO,
        dueDate: new Date(input.dueDate),
        dueTime: input.dueTime || null,
        courseCode: input.courseCode || null,
      },
      include: {
        category: true,
      },
    });

    return this.formatTaskResponse(task);
  }

  async getTasks(userId: string, query: TaskListQuery): Promise<PaginatedTasksResponse> {
    const {
      status,
      priority,
      categoryId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'dueDate',
      sortOrder = 'asc',
    } = query;

    const where: any = { userId };
    const now = new Date();

    // Status filter handling (including derived OVERDUE)
    if (status) {
      if (status === 'OVERDUE') {
        where.status = { not: TaskStatus.COMPLETED };
        where.dueDate = { lt: now };
      } else {
        where.status = status;
      }
    }

    // Priority filter
    if (priority) {
      where.priority = priority;
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Search filter
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { courseCode: { contains: searchTerm } },
      ];
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    const formattedTasks = tasks.map((t) => this.formatTaskResponse(t));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      tasks: formattedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getTaskById(userId: string, taskId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!task) {
      throw new Error('Không tìm thấy công việc');
    }

    return this.formatTaskResponse(task);
  }

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<TaskResponse> {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      throw new Error('Không tìm thấy công việc');
    }

    if (input.categoryId) {
      await this.validateCategoryAccess(userId, input.categoryId);
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId || null;
    if (input.dueDate !== undefined) updateData.dueDate = new Date(input.dueDate);
    if (input.dueTime !== undefined) updateData.dueTime = input.dueTime || null;
    if (input.courseCode !== undefined) updateData.courseCode = input.courseCode || null;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        category: true,
      },
    });

    return this.formatTaskResponse(updatedTask);
  }

  async changeTaskStatus(userId: string, taskId: string, newStatus: TaskStatus): Promise<TaskResponse> {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      throw new Error('Không tìm thấy công việc');
    }

    const updateData: any = {
      status: newStatus,
    };

    if (newStatus === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
      updateData.subtasksCountCompleted = existingTask.subtasksCountTotal;
    } else if (existingTask.status === TaskStatus.COMPLETED) {
      updateData.completedAt = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        category: true,
      },
    });

    return this.formatTaskResponse(updatedTask);
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      throw new Error('Không tìm thấy công việc');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });
  }
}

export const tasksService = new TasksService();
