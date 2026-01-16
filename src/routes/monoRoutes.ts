import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import * as monoController from '../controllers/monoController';

const router = Router();

router.get('/webhook', monoController.verifyWebhook);
router.post('/webhook', monoController.handleWebhook);

router.use(authMiddleware);

router.get('/sync-accounts', monoController.syncMonoAccounts);
router.patch('/link-account', monoController.linkAccount);

export default router;