import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import * as wishlistController from '../controllers/wishlistController';

const router = Router();

router.post('/', authMiddleware, wishlistController.addWishItem);
router.get('/', authMiddleware, wishlistController.getWishList);

export default router;