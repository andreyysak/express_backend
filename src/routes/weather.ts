import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import * as weatherController from '../controllers/weatherController';

const router = Router()

router.use(authMiddleware)

router.get('/weather', weatherController.getWeatherForUser)

export  default router