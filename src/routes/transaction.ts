import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import * as transactionController from "../controllers/transactionController";

const router = Router()

router.use(authMiddleware)

router.get('/transactions', transactionController.getTransactions);
router.post('/transactions', transactionController.createTransaction);

export default router;