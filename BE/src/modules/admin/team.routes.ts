import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { sendError, sendSuccess } from '../../utils/response';

const router = Router();
const roles = ['ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD', 'USER'] as const;
const input = z.object({
  title: z.string().trim().min(1).max(200),
  assigneeId: z.string().min(1).optional(),
  role: z.enum(roles).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.iso.datetime(),
});

router.use((req, res, next) => {
  if (!['ADMIN', 'ENTERPRISE_LEAD'].includes(req.user!.role)) {
    sendError(res, 'Bạn không có quyền quản lý công việc đội ngũ.', undefined, 403);
    return;
  }
  next();
});

router.get('/', async (_req, res, next) => {
  try {
    const [members, tasks] = await prisma.$transaction([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, status: true }, orderBy: { name: 'asc' } }),
      prisma.task.findMany({ select: { id: true, title: true, userId: true, status: true, priority: true, dueDate: true }, orderBy: { createdAt: 'desc' } }),
    ]);
    sendSuccess(res, 'Đã tải công việc đội ngũ', { members, tasks });
  } catch (error) { if (error instanceof z.ZodError) { sendError(res, 'Dữ liệu công việc không hợp lệ.', error.issues, 400); return; } next(error); }
});

router.post('/tasks', async (req, res, next) => {
  try {
    const body = input.parse(req.body);
    const candidates = await prisma.user.findMany({
      where: { status: 'ACTIVE', ...(body.role ? { role: body.role } : {}), ...(body.assigneeId ? { id: body.assigneeId } : {}) },
      select: { id: true, _count: { select: { tasks: { where: { status: { not: 'COMPLETED' } } } } } },
      orderBy: { id: 'asc' },
    });
    candidates.sort((a, b) => a._count.tasks - b._count.tasks);
    if (!candidates.length) { sendError(res, 'Không có thành viên đang hoạt động phù hợp.', undefined, 400); return; }
    const task = await prisma.task.create({ data: {
      title: body.title, userId: candidates[0].id, priority: body.priority, dueDate: new Date(body.dueDate),
    } });
    sendSuccess(res, 'Đã phân công công việc', { task }, 201);
  } catch (error) { if (error instanceof z.ZodError) { sendError(res, 'Dữ liệu công việc không hợp lệ.', error.issues, 400); return; } next(error); }
});

router.patch('/tasks/:id', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']) }).parse(req.body);
    const taskId = String(req.params.id);
    const result = await prisma.task.updateMany({ where: { id: taskId }, data: { status, completedAt: status === 'COMPLETED' ? new Date() : null } });
    if (!result.count) { sendError(res, 'Công việc không còn tồn tại.', undefined, 404); return; }
    sendSuccess(res, 'Đã cập nhật trạng thái');
  } catch (error) { if (error instanceof z.ZodError) { sendError(res, 'Dữ liệu công việc không hợp lệ.', error.issues, 400); return; } next(error); }
});

export default router;
