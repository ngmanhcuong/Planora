import { Router } from 'express';
import { EventsController } from './events.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/prisma';
import { sendSuccess } from '../../utils/response';

const eventRouter = Router();
const calendarRouter = Router();

// Apply auth middleware
eventRouter.use(authenticate);
calendarRouter.use(authenticate);

// IMPORTANT ROUTE ORDER: /conflicts/check MUST come BEFORE /:id
eventRouter.get('/conflicts/check', EventsController.checkConflicts);
eventRouter.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ where: { OR: [{ userId: req.user!.userId }, { isSystem: true }] }, orderBy: { name: 'asc' } });
    sendSuccess(res, 'Danh mục lịch trình', { categories });
  } catch (error) { next(error); }
});

eventRouter.post('/', EventsController.createEvent);
eventRouter.get('/', EventsController.listEvents);
eventRouter.get('/:id', EventsController.getEventById);
eventRouter.patch('/:id', EventsController.updateEvent);
eventRouter.delete('/:id', EventsController.deleteEvent);

calendarRouter.get('/', EventsController.getCalendarRange);

export { eventRouter as eventRoutes, calendarRouter as calendarRoutes };
