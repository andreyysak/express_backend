import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { transactionSchema } from "../schemas/validationSchema";
import * as transactionController from '../controllers/transactionController';

const router = Router();

router.use(authMiddleware);

router.get('/', transactionController.getTransactions);
router.post('/', validate(transactionSchema), transactionController.createTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;