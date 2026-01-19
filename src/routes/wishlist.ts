import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import * as wishlistController from '../controllers/wishlistController';

const router = Router();

router.use(authMiddleware);

router.post('/', wishlistController.addWishItem);
router.get('/', wishlistController.getWishList);
router.patch('/:id', wishlistController.updateWishItem);
router.delete('/:id', wishlistController.deleteWishItem);

export default router;