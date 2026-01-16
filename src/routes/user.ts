import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', authMiddleware, userController.getMe);
router.get('/me/updateCity', authMiddleware, userController.updateUserCity)

export default router;