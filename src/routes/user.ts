import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { userUpdateSchema } from '../schemas/validationSchema';

const router = Router();

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.delete('/me', userController.deleteUser);

router.patch('/me/email', validate(userUpdateSchema), userController.updateEmail);
router.patch('/me/phone', validate(userUpdateSchema), userController.updatePhone);
router.patch('/me/location', validate(userUpdateSchema), userController.updateLocation);
router.patch('/me/telegram', validate(userUpdateSchema), userController.updateTelegramInfo);
router.patch('/me/image', validate(userUpdateSchema), userController.updateImage);

export default router;