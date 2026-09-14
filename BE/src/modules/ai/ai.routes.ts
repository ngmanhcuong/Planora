import { Router } from 'express';
import { AiController } from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.get('/status', AiController.getStatus);
aiRouter.post('/prioritize-tasks', AiController.prioritizeTasks);
aiRouter.post('/schedule', AiController.generateSchedule);
aiRouter.post('/schedule/apply', AiController.applySchedule);
aiRouter.post('/assistant', AiController.assistantChat);

export { aiRouter as aiRoutes };
