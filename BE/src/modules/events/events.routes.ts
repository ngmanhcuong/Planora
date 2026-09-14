import { Router } from 'express';
import { EventsController } from './events.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const eventRouter = Router();
const calendarRouter = Router();

// Apply auth middleware
eventRouter.use(authenticate);
calendarRouter.use(authenticate);

// IMPORTANT ROUTE ORDER: /conflicts/check MUST come BEFORE /:id
eventRouter.get('/conflicts/check', EventsController.checkConflicts);

eventRouter.post('/', EventsController.createEvent);
eventRouter.get('/', EventsController.listEvents);
eventRouter.get('/:id', EventsController.getEventById);
eventRouter.patch('/:id', EventsController.updateEvent);
eventRouter.delete('/:id', EventsController.deleteEvent);

calendarRouter.get('/', EventsController.getCalendarRange);

export { eventRouter as eventRoutes, calendarRouter as calendarRoutes };
