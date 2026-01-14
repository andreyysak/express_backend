import { Router } from 'express';
import * as fuelController from '../controllers/fuelController';

const router = Router();
router.get('/', fuelController.getAllFuel);
router.post('/', fuelController.createFuel);
router.put('/:id', fuelController.updateFuel);
router.delete('/:id', fuelController.deleteFuel);
router.get('/search', fuelController.searchFuelByStation);
router.get('/:id', fuelController.getFuelById);
export default router;