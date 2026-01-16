import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { tripSchema } from "../schemas/validationSchema";
import * as tripController from '../controllers/tripController';

const router = Router();

router.use(authMiddleware);

router.get('/', tripController.getAllTrips);
router.get('/search', tripController.getTripsByDirection);
router.get('/:id', tripController.getTripById);

router.post('/', validate(tripSchema), tripController.createTrip);
router.patch('/:id', validate(tripSchema), tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

export default router;