import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const notificationRouter = Router();

notificationRouter.use(authenticate);

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
