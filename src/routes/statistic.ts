import { Router } from 'express';
import {
    getFullStatistics,
    getTripStatistics,
    getCarEfficiency,
    getTopCategories,
    getDailySpendingTrend,
    getWeekdayStats,
    getFuelPriceExtremes,
    getSpendingAnomalies,
    getSavingsRate,
    getMaintenanceCostIndex,
    getFavoriteStations,
    getSpendingForecast,
    getTripTimeStats,
    getTripWorkdayVsWeekend,
    getTripExtremes,
    getWeeklyMileageTrend,
    getTopDirections,
    getCarUsageFrequency, sendTelegramReport
} from '../controllers/statisticController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/full', authMiddleware, getFullStatistics);
router.get('/trips', authMiddleware, getTripStatistics);
router.get('/efficiency', authMiddleware, getCarEfficiency);
router.get('/top-categories', authMiddleware, getTopCategories);
router.get('/daily-trend', authMiddleware, getDailySpendingTrend);
router.get('/weekday', authMiddleware, getWeekdayStats);
router.get('/fuel-extremes', authMiddleware, getFuelPriceExtremes);
router.get('/anomalies', authMiddleware, getSpendingAnomalies);
router.get('/savings-rate', authMiddleware, getSavingsRate);
router.get('/maintenance-index', authMiddleware, getMaintenanceCostIndex);
router.get('/favorite-stations', authMiddleware, getFavoriteStations);
router.get('/spending-forecast', authMiddleware, getSpendingForecast);
router.get('/trip-time', authMiddleware, getTripTimeStats);
router.get('/trip-work-weekend', authMiddleware, getTripWorkdayVsWeekend);
router.get('/trip-extremes', authMiddleware, getTripExtremes);
router.get('/weekly-mileage', authMiddleware, getWeeklyMileageTrend);
router.get('/top-directions', authMiddleware, getTopDirections);
router.get('/usage-frequency', authMiddleware, getCarUsageFrequency);
router.post('/send-telegram', authMiddleware, sendTelegramReport);

export default router;