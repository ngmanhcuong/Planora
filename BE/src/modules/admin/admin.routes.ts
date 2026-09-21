import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/admin.middleware';
import {
  createAdminUser,
  createCampaign,
  createCategoryTemplate,
  createContent,
  createTicket,
  deleteAdminUser,
  deleteCategoryTemplate,
  deleteConfig,
  deleteContent,
  getAdminAnalytics,
  getAdminOverview,
  listAdminUsers,
  listCampaigns,
  listCategoryTemplates,
  listConfigs,
  listContent,
  listTickets,
  resetAdminUserPassword,
  sendCampaign,
  updateAdminUserAccount,
  updateCategoryTemplate,
  updateContent,
  updateTicket,
  upsertConfig,
} from './admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/overview', getAdminOverview);
router.get('/analytics', getAdminAnalytics);
router.get('/users', listAdminUsers);
router.post('/users', createAdminUser);
router.patch('/users/:id/account', updateAdminUserAccount);
router.patch('/users/:id/role', updateAdminUserAccount);
router.patch('/users/:id/verification', updateAdminUserAccount);
router.patch('/users/:id/password', resetAdminUserPassword);
router.delete('/users/:id', deleteAdminUser);

router.get('/support/tickets', listTickets);
router.post('/support/tickets', createTicket);
router.patch('/support/tickets/:id', updateTicket);

router.get('/system/configs', listConfigs);
router.post('/system/configs', upsertConfig);
router.delete('/system/configs/:id', deleteConfig);
router.get('/system/category-templates', listCategoryTemplates);
router.post('/system/category-templates', createCategoryTemplate);
router.patch('/system/category-templates/:id', updateCategoryTemplate);
router.delete('/system/category-templates/:id', deleteCategoryTemplate);

router.get('/notification-campaigns', listCampaigns);
router.post('/notification-campaigns', createCampaign);
router.post('/notification-campaigns/:id/send', sendCampaign);

router.get('/content', listContent);
router.post('/content', createContent);
router.patch('/content/:id', updateContent);
router.delete('/content/:id', deleteContent);

export default router;
