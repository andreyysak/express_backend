import { Router } from 'express';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/notionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;