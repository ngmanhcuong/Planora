import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { NotesController } from './notes.controller';

const router = Router();
router.use(authenticate);
router.get('/', NotesController.list);
router.post('/', NotesController.create);
router.patch('/:id', NotesController.update);
router.delete('/:id', NotesController.remove);

export { router as noteRoutes };
