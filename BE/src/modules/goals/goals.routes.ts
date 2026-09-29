import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { GoalsController } from './goals.controller';

const router = Router();
router.use(authenticate);
router.get('/', GoalsController.list);
router.post('/', GoalsController.create);
router.put('/:id', GoalsController.update);
router.delete('/:id', GoalsController.remove);

export { router as goalRoutes };
