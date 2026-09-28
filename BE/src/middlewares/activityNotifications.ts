import { RequestHandler } from 'express';
import { NotificationType } from '@prisma/client';
import { prisma } from '../config/prisma';

const resources: Record<string, { type: NotificationType; link: string }> = {
  tasks: { type: NotificationType.DEADLINE, link: '/tasks' },
  events: { type: NotificationType.EVENT, link: '/calendar' },
  timetables: { type: NotificationType.TIMETABLE, link: '/timetable' },
  habits: { type: NotificationType.HABIT, link: '/dashboard' },
  profile: { type: NotificationType.SYSTEM, link: '/profile' },
  settings: { type: NotificationType.SYSTEM, link: '/settings' },
};

// Record successful user mutations before releasing the response, so the UI can
// immediately fetch the new notification. Reminder deduplication does not apply.
export const activityNotifications: RequestHandler = (req, res, next) => {
  const path = req.path.split('/').filter(Boolean);
  // The first added class bootstraps its semester in a separate request.
  // Only the class creation should notify the user for that single action.
  if (req.method === 'POST' && path.length === 1 && path[0] === 'timetables' && req.body?.autoCreated === true) {
    next();
    return;
  }
  const resource = resources[path[0]] || (req.path === '/ai/schedule/apply'
    ? { type: NotificationType.EVENT, link: '/calendar' } : undefined);
  if (!resource || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    next();
    return;
  }
  const json = res.json.bind(res);
  res.json = (body) => {
    if (!req.user?.userId || res.statusCode >= 400 || body?.success !== true) return json(body);
    const entity = body.data?.task || body.data?.event || body.data?.item || body.data?.timetable || body.data?.habit;
    const name = entity?.title || entity?.name || entity?.subjectName;
    void prisma.notification.create({
      data: {
        userId: req.user.userId,
        type: resource.type,
        title: body.message,
        message: name ? `“${name}”` : '',
        link: resource.link,
        relatedEntityType: path[0].toUpperCase(),
        relatedEntityId: entity?.id || null,
      },
    }).then(() => json(body)).catch((error) => {
      // A notification failure must not report an already saved mutation as failed.
      console.error('Failed to save activity notification', error);
      json(body);
    });
    return res;
  };
  next();
};
