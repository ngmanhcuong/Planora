import { Router } from 'express';
import { getHealthStatus, getReadinessStatus } from '../controllers/healthController';

const router = Router();

router.get('/health', getHealthStatus);
router.get('/ready', getReadinessStatus);

export default router;
