import { Router } from 'express';
import * as abuseController from '../controllers/abusedbController';
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware)

router.get('/check', abuseController.checkIpReputation);

export default router;