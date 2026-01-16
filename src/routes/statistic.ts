import { Router } from 'express';
import { sendTelegramReport } from '../services/telegramService';
import { authMiddleware } from '../middlewares/authMiddleware';
import {getFullStatistics} from "../controllers/statisticController";

const router = Router();

router.get('/', authMiddleware, getFullStatistics);

router.post('/send-to-tg', authMiddleware, async (req, res) => {
    try {
        const stats = req.body.stats;
        await sendTelegramReport(stats);
        res.json({ message: 'Report sent to Telegram' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;