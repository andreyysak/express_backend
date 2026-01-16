import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { fuelSchema } from "../schemas/validationSchema";
import * as fuelController from '../controllers/fuelController';

const router = Router();

router.use(authMiddleware);

router.get('/', fuelController.getAllFuel);
router.get('/search', fuelController.searchFuelByStation);
router.get('/:id', fuelController.getFuelById);

router.post('/', validate(fuelSchema), fuelController.createFuel);
router.patch('/:id', validate(fuelSchema), fuelController.updateFuel);
router.delete('/:id', fuelController.deleteFuel);

export default router;