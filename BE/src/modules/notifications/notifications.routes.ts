import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';

const notificationRouter = Router();

notificationRouter.use(authenticate);

// Goals and notes currently live in the browser; only accept their activity
// metadata, and always derive the recipient and destination on the server.
const activitySchema = z.object({
  entity: z.enum(['goal', 'note', 'category']),
  action: z.enum(['create', 'update', 'delete', 'status', 'pin']),
});
notificationRouter.post('/activity', async (req, res, next) => {
  const parsed = activitySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Hoạt động không hợp lệ', undefined, 400);
    return;
  }
  const labels = { goal: 'mục tiêu', note: 'ghi chú', category: 'danh mục mục tiêu' };
  const actions = { create: 'Đã thêm', update: 'Đã cập nhật', delete: 'Đã xóa', status: 'Đã đổi trạng thái', pin: 'Đã đổi ghim' };
  const { entity, action } = parsed.data;
  const title = `${actions[action]} ${labels[entity]}`;
  try {
    const notification = await prisma.notification.create({ data: {
      userId: req.user!.userId, type: 'SYSTEM', title, message: title,
      relatedEntityType: entity.toUpperCase(), link: entity === 'note' ? '/notes' : '/goals',
    } });
    sendSuccess(res, title, { notification }, 201);
  } catch (error) { next(error); }
});

// IMPORTANT EXPRESS ROUTE ORDER:
// Static routes MUST be mounted BEFORE dynamic /:id routes to prevent collisions.
notificationRouter.get('/unread-count', NotificationsController.getUnreadCount);
notificationRouter.patch('/read-all', NotificationsController.markAllAsRead);
notificationRouter.delete('/read', NotificationsController.clearReadNotifications);
notificationRouter.post('/generate', NotificationsController.generateDueNotifications);

// Single notification read/unread status actions
notificationRouter.patch('/:id/read', NotificationsController.markAsRead);
notificationRouter.patch('/:id/unread', NotificationsController.markAsUnread);

// Standard notification routes
notificationRouter.get('/', NotificationsController.listNotifications);
notificationRouter.get('/:id', NotificationsController.getNotificationById);
notificationRouter.delete('/:id', NotificationsController.deleteNotification);

export { notificationRouter as notificationRoutes };
