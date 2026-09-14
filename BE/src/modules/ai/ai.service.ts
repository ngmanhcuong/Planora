import { prisma } from '../../config/prisma';
import {
  AiStatusResponse,
  TaskPrioritizationRequest,
  TaskPrioritizationResponse,
  TaskPriorityRecommendation,
  ScheduleRequest,
  ScheduleResponse,
  ScheduleSuggestion,
  ApplyScheduleRequest,
  AssistantRequest,
  AssistantResponse,
  AiProvider,
} from './ai.types';
import { defaultAiProvider } from './ai.provider';
import { buildUserAiContext } from './ai.context';
import { calculateFreeSlots } from './ai.freeSlots';
import { TASK_PRIORITIZATION_PROMPT, SMART_SCHEDULE_PROMPT, ASSISTANT_PROMPT } from './ai.prompts';

export class AiService {
  private provider: AiProvider;

  constructor(provider: AiProvider = defaultAiProvider) {
    this.provider = provider;
  }

  private checkProviderConfigured(): void {
    if (!this.provider.isConfigured()) {
      const err: any = new Error('AI Assistant currently disabled or missing API key.');
      err.statusCode = 503;
      throw err;
    }
  }

  async getStatus(): Promise<AiStatusResponse> {
    return {
      enabled: this.provider.isConfigured(),
      provider: this.provider.getProviderName(),
      model: this.provider.getModelName(),
    };
  }

  async prioritizeTasks(
    userId: string,
    payload: TaskPrioritizationRequest
  ): Promise<TaskPrioritizationResponse> {
    this.checkProviderConfigured();

    // 1. Fetch user incomplete tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: { not: 'COMPLETED' },
        ...(payload.taskIds && payload.taskIds.length > 0 ? { id: { in: payload.taskIds } } : {}),
      },
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        dueTime: true,
        courseCode: true,
      },
    });

    if (tasks.length === 0) {
      return { recommendations: [] };
    }

    const now = new Date();

    // 2. Deterministic baseline scoring
    const scoredTasks = tasks.map((t) => {
      const due = new Date(t.dueDate);
      const isOverdue = due < now;
      const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

      let baseScore = 0;
      if (isOverdue) baseScore += 1000;
      else if (hoursUntilDue < 24) baseScore += 500;
      else if (hoursUntilDue < 72) baseScore += 200;

      const priorityWeight: Record<string, number> = { URGENT: 400, HIGH: 300, MEDIUM: 200, LOW: 100 };
      baseScore += priorityWeight[t.priority] || 200;

      let suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = t.priority as any;
      if (isOverdue || hoursUntilDue < 24) suggestedPriority = 'URGENT';
      else if (hoursUntilDue < 72 && t.priority !== 'URGENT') suggestedPriority = 'HIGH';

      let reason = `Hạn chót vào ngày ${t.dueDate.toISOString().split('T')[0]}`;
      if (isOverdue) reason = 'Công việc đã quá hạn, cần ưu tiên xử lý ngay.';
      else if (hoursUntilDue < 24) reason = 'Hạn chót trong vòng 24h tới.';

      return {
        taskId: t.id,
        score: baseScore,
        suggestedPriority,
        reason,
        title: t.title,
      };
    });

    // Sort descending by score
    scoredTasks.sort((a, b) => b.score - a.score);

    const deterministicRecs: TaskPriorityRecommendation[] = scoredTasks.map((item, idx) => ({
      taskId: item.taskId,
      rank: idx + 1,
      suggestedPriority: item.suggestedPriority,
      reason: item.reason,
    }));

    const fallback: TaskPrioritizationResponse = { recommendations: deterministicRecs };

    // 3. Optional structured AI refinement
    const userPrompt = JSON.stringify({
      currentTime: now.toISOString(),
      tasks: scoredTasks.map((s) => ({ id: s.taskId, title: s.title, priority: s.suggestedPriority })),
    });

    return this.provider.generateStructured<TaskPrioritizationResponse>(
      TASK_PRIORITIZATION_PROMPT,
      userPrompt,
      fallback
    );
  }

  async generateSchedule(
    userId: string,
    payload: ScheduleRequest
  ): Promise<ScheduleResponse> {
    this.checkProviderConfigured();

    const startRange = new Date(payload.startDate);
    const endRange = new Date(payload.endDate);

    // Enforce max 30 days range
    const maxDays = 30;
    const diffDays = (endRange.getTime() - startRange.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > maxDays) {
      throw new Error('Khoảng thời gian lập lịch tối đa là 30 ngày.');
    }

    // 1. Fetch requested tasks belonging to user
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        id: { in: payload.taskIds },
        status: { not: 'COMPLETED' },
      },
    });

    if (tasks.length === 0) {
      return { suggestions: [], warnings: ['Không tìm thấy công việc hợp lệ để lập lịch.'] };
    }

    // 2. Fetch user events & active timetable in date range
    const events = await prisma.event.findMany({
      where: {
        userId,
        startTime: { lte: endRange },
        endTime: { gte: startRange },
      },
      select: { startTime: true, endTime: true, title: true },
    });

    const mappedEvents = events.map((e) => ({
      startAt: e.startTime,
      endAt: e.endTime,
      title: e.title,
    }));

    const activeTimetable = await prisma.timetable.findFirst({
      where: { userId, isCurrent: true },
      include: { items: true },
    });

    // 3. Calculate candidate free slots
    const freeSlots = calculateFreeSlots(
      payload.startDate,
      payload.endDate,
      mappedEvents,
      activeTimetable?.items || [],
      payload.preferences?.preferredSessionMinutes || 60
    );

    if (freeSlots.length === 0) {
      return {
        suggestions: [],
        warnings: ['Không tìm thấy khung giờ trống phù hợp trong khoảng thời gian đã chọn.'],
      };
    }

    // 4. Deterministic assignment into candidate free slots
    const suggestions: ScheduleSuggestion[] = [];
    const sessionDurationMinutes = payload.preferences?.preferredSessionMinutes || 60;
    const sessionMs = sessionDurationMinutes * 60 * 1000;

    let slotIdx = 0;
    for (const task of tasks) {
      if (slotIdx >= freeSlots.length) break;

      const slot = freeSlots[slotIdx];
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      // Check if slot has enough room for session
      if (slotEnd.getTime() - slotStart.getTime() >= sessionMs) {
        const sessionEnd = new Date(slotStart.getTime() + sessionMs);

        suggestions.push({
          taskId: task.id,
          taskTitle: task.title,
          start: slotStart.toISOString(),
          end: sessionEnd.toISOString(),
          reason: `Khung giờ trống từ ${slotStart.getHours()}:${String(slotStart.getMinutes()).padStart(2, '0')}, không trùng lịch học hay sự kiện khác.`,
          confidence: 0.9,
        });

        // Advance pointer in this slot or move to next slot
        if (slotEnd.getTime() - sessionEnd.getTime() >= sessionMs) {
          freeSlots[slotIdx].start = sessionEnd.toISOString();
        } else {
          slotIdx++;
        }
      } else {
        slotIdx++;
      }
    }

    const fallback: ScheduleResponse = { suggestions, warnings: [] };

    // 5. Optional AI refinement
    return this.provider.generateStructured<ScheduleResponse>(
      SMART_SCHEDULE_PROMPT,
      JSON.stringify({ freeSlots, tasks: tasks.map((t) => ({ id: t.id, title: t.title })) }),
      fallback
    );
  }

  async applySchedule(
    userId: string,
    payload: ApplyScheduleRequest
  ): Promise<{ appliedCount: number; createdEventIds: string[] }> {
    return prisma.$transaction(async (tx) => {
      const createdEventIds: string[] = [];

      for (const session of payload.sessions) {
        const startD = new Date(session.start);
        const endD = new Date(session.end);

        if (isNaN(startD.getTime()) || isNaN(endD.getTime()) || startD >= endD) {
          throw new Error(`Thời gian buổi học không hợp lệ cho công việc ID ${session.taskId}`);
        }

        // 1. Verify task ownership & status
        const task = await tx.task.findFirst({
          where: { id: session.taskId, userId, status: { not: 'COMPLETED' } },
        });

        if (!task) {
          throw new Error(`Công việc ID ${session.taskId} không tồn tại hoặc đã hoàn thành.`);
        }

        // 2. Recheck event conflicts in database
        const conflictEvent = await tx.event.findFirst({
          where: {
            userId,
            startTime: { lt: endD },
            endTime: { gt: startD },
          },
        });

        if (conflictEvent) {
          throw new Error(`Xung đột lịch trình với sự kiện "${conflictEvent.title}" từ ${conflictEvent.startTime.toISOString()}`);
        }

        // 3. Create planned focus event
        const createdEvent = await tx.event.create({
          data: {
            userId,
            title: `Tập trung: ${task.title}`,
            description: `Buổi học tập trung cho công việc: ${task.title}`,
            startTime: startD,
            endTime: endD,
          },
        });

        createdEventIds.push(createdEvent.id);
      }

      return {
        appliedCount: createdEventIds.length,
        createdEventIds,
      };
    });
  }

  async assistantChat(
    userId: string,
    payload: AssistantRequest
  ): Promise<AssistantResponse> {
    this.checkProviderConfigured();

    const userContext = await buildUserAiContext(userId);

    const fullSystemPrompt = `${ASSISTANT_PROMPT}\nUSER CONTEXT:\n${JSON.stringify(userContext, null, 2)}`;
    const answer = await this.provider.chat(fullSystemPrompt, payload.message);

    return {
      answer,
      suggestedActions: [
        { label: 'Gợi ý lập lịch hôm nay', action: 'SCHEDULE_TODAY' },
        { label: 'Xem ưu tiên công việc', action: 'PRIORITIZE_TASKS' },
      ],
    };
  }
}

export const aiService = new AiService();
