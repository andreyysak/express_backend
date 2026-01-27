import { Router } from 'express';
import { 
    getExercises, 
    createExercise, 
    deleteExercise 
} from '../controllers/exerciseController';
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get('/user/:userId', getExercises);
router.post('/', createExercise);
router.delete('/:id', deleteExercise);

export default router;