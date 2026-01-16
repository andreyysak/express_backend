import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import * as categoryController from '../controllers/categoryController';
import {categorySchema} from "../schemas/validationSchema";

const router = Router();

router.use(authMiddleware);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', validate(categorySchema), categoryController.createCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;