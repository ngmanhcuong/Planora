import { Router } from 'express';
import { TimetablesController } from './timetables.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const timetablesRouter = Router();
const weeklyTimetableRouter = Router();

timetablesRouter.use(authenticate);
weeklyTimetableRouter.use(authenticate);

// Timetable Items & Conflicts routes
// Static sub-route /conflicts/check MUST come BEFORE dynamic item sub-routes or :id
timetablesRouter.get('/:timetableId/conflicts/check', TimetablesController.checkConflicts);

// Timetable Items CRUD
timetablesRouter.post('/:timetableId/items', TimetablesController.createTimetableItem);
timetablesRouter.get('/:timetableId/items', TimetablesController.listTimetableItems);
timetablesRouter.get('/:timetableId/items/:itemId', TimetablesController.getTimetableItemById);
timetablesRouter.patch('/:timetableId/items/:itemId', TimetablesController.updateTimetableItem);
timetablesRouter.delete('/:timetableId/items/:itemId', TimetablesController.deleteTimetableItem);

// Timetable CRUD
timetablesRouter.post('/', TimetablesController.createTimetable);
timetablesRouter.get('/', TimetablesController.listTimetables);
timetablesRouter.get('/:id', TimetablesController.getTimetableById);
timetablesRouter.patch('/:id', TimetablesController.updateTimetable);
timetablesRouter.delete('/:id', TimetablesController.deleteTimetable);

// Weekly Timetable representation endpoint: GET /api/timetable/week
weeklyTimetableRouter.get('/week', TimetablesController.getWeeklyTimetable);

export { timetablesRouter, weeklyTimetableRouter };
