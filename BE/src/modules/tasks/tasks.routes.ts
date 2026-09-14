import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  changeTaskStatus,
  deleteTask,
} from './tasks.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTaskById);
router.patch('/:id', authenticate, updateTask);
router.patch('/:id/status', authenticate, changeTaskStatus);
router.delete('/:id', authenticate, deleteTask);

export default router;
