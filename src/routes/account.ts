import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import * as accountController from '../controllers/accountController';
import {accountSchema} from "../schemas/validationSchema";

const router = Router();

router.use(authMiddleware);

router.get('/', accountController.getAccounts);
router.get('/:id', accountController.getAccount);

router.post('/', validate(accountSchema), accountController.createAccount);

router.patch('/:id', validate(accountSchema), accountController.updateAccount);

router.delete('/:id', accountController.deleteAccount);

export default router;