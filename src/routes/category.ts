import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import * as categoryController from '../controllers/categoryController';

const router = Router()

router.use(authMiddleware)

router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.createCategory)
router.delete('/categories/:id', categoryController.deleteCategory)

export default router