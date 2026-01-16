import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { maintenanceSchema } from "../schemas/validationSchema";
import * as maintenanceController from '../controllers/maintenanceController';

const router = Router();

router.use(authMiddleware);

router.get('/', maintenanceController.getAllMaintenance);
router.get('/search', maintenanceController.searchMaintenanceByDescription);
router.get('/:id', maintenanceController.getMaintenanceById);

router.post('/', validate(maintenanceSchema), maintenanceController.createMaintenance);
router.patch('/:id', validate(maintenanceSchema), maintenanceController.updateMaintenance);
router.delete('/:id', maintenanceController.deleteMaintenance);

export default router;