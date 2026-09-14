import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const dashboardRouter = Router();

dashboardRouter.use(authenticate);

// IMPORTANT EXPRESS ROUTE ORDER:
// Static sub-routes under /statistics MUST be mounted BEFORE /
dashboardRouter.get('/statistics/weekly', DashboardController.getWeeklyStatistics);
dashboardRouter.get('/statistics/monthly', DashboardController.getMonthlyStatistics);

// Main dashboard aggregation endpoint: GET /api/dashboard
dashboardRouter.get('/', DashboardController.getDashboard);

export { dashboardRouter as dashboardRoutes };
