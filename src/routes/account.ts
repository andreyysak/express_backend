import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import * as accountController from '../controllers/accountController';

const router = Router()

router.use(authMiddleware)

router.get('/accounts', accountController.getAccounts)
router.post('/accounts', accountController.createAccount)

export default router