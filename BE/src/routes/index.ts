import { Router } from 'express';
import healthRoutes from './healthRoutes';
import { authRoutes } from '../modules/auth';
import { profileRoutes } from '../modules/profile';
import { settingsRoutes } from '../modules/settings';
import { taskRoutes } from '../modules/tasks';
import { eventRoutes, calendarRoutes } from '../modules/events';
import { timetablesRouter, weeklyTimetableRouter } from '../modules/timetables';
import { habitRoutes } from '../modules/habits';
import { notificationRoutes } from '../modules/notifications';
import { dashboardRoutes } from '../modules/dashboard';
import { aiRoutes } from '../modules/ai';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/settings', settingsRoutes);
router.use('/tasks', taskRoutes);
router.use('/events', eventRoutes);
router.use('/calendar', calendarRoutes);
router.use('/timetables', timetablesRouter);
router.use('/timetable', weeklyTimetableRouter);
router.use('/habits', habitRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);

export default router;





