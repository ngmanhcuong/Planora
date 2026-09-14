import { Router } from 'express';
import { HabitsController } from './habits.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const habitsRouter = Router();

habitsRouter.use(authenticate);

// IMPORTANT EXPRESS ROUTE ORDER:
// /today MUST come BEFORE /:id to prevent Express from capturing "today" as an ID.
habitsRouter.get('/today', HabitsController.getTodayHabits);

// Habit Check-in & History sub-routes
habitsRouter.post('/:id/check-in', HabitsController.checkIn);
habitsRouter.delete('/:id/check-in', HabitsController.undoCheckIn);
habitsRouter.get('/:id/history', HabitsController.getHabitHistory);
habitsRouter.get('/:id/weekly-summary', HabitsController.getWeeklySummary);

// Habit CRUD
habitsRouter.post('/', HabitsController.createHabit);
habitsRouter.get('/', HabitsController.listHabits);
habitsRouter.get('/:id', HabitsController.getHabitById);
habitsRouter.patch('/:id', HabitsController.updateHabit);
habitsRouter.delete('/:id', HabitsController.deleteHabit);

export { habitsRouter as habitRoutes };
