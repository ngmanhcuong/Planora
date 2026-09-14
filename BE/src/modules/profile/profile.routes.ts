import { Router } from 'express';
import { getProfile, updateProfile } from './profile.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getProfile);
router.patch('/', authenticate, updateProfile);

export default router;
