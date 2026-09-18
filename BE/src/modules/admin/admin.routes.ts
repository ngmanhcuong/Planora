import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/admin.middleware';
import {
  deleteAdminUser,
  getAdminOverview,
  listAdminUsers,
  resetAdminUserPassword,
  updateAdminUserRole,
  updateAdminUserVerification,
} from './admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/overview', getAdminOverview);
router.get('/users', listAdminUsers);
router.patch('/users/:id/role', updateAdminUserRole);
router.patch('/users/:id/verification', updateAdminUserVerification);
router.patch('/users/:id/password', resetAdminUserPassword);
router.delete('/users/:id', deleteAdminUser);

export default router;
