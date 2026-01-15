import { Router } from 'express';
import { getTasks, createTask, deleteTask } from '../controllers/notionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getTasks);
router.post('/', authMiddleware, createTask);
router.delete('/:id', authMiddleware, deleteTask);

export default router;