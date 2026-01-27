import { Router } from 'express';
import {
    createWorkout,
    getUserWorkouts,
    updateWorkout,
    deleteWorkout
} from '../controllers/workoutController';
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post('/', createWorkout);
router.get('/user/:userId', getUserWorkouts);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;