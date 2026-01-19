import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import * as weatherController from '../controllers/weatherController';

const router = Router();

router.use(authMiddleware);

router.get('/', weatherController.getWeatherFull);
router.get('/temp', weatherController.getTemperatureOnly);
router.get('/wind', weatherController.getWindOnly);
router.get('/description', weatherController.getDescriptionOnly);
router.get('/forecast/day', weatherController.getForecastDay);
router.get('/forecast/week', weatherController.getForecastWeek);
router.get('/sun', weatherController.getSunCycle);
router.get('/pressure', weatherController.getPressureAndHumidity);
router.get('/visibility', weatherController.getVisibility);
router.get('/advice/driver', weatherController.getDriverAdvice);
router.get('/advice/clothing', weatherController.getClothingAdvice);
router.get('/risk', weatherController.getPollutionRisk);

export default router;