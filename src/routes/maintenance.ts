import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenanceController';

const router = Router();

router.get('/', maintenanceController.getAllMaintenance);
router.get('/search', maintenanceController.searchMaintenanceByDescription);
router.get('/:id', maintenanceController.getMaintenanceById);
router.post('/', maintenanceController.createMaintenance);
router.put('/:id', maintenanceController.updateMaintenance);
router.delete('/:id', maintenanceController.deleteMaintenance);

export default router;