import { Router } from 'express';
import { getSettings, updateSettings, changePassword } from './settings.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getSettings);
router.patch('/', authenticate, updateSettings);
router.patch('/password', authenticate, changePassword);

export default router;
