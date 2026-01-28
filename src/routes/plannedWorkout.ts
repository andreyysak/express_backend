import { Router } from 'express';
import {
    createPlannedWorkout,
    getUserPlannedWorkouts,
    deletePlannedWorkout
} from '../controllers/plannedWorkoutController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createPlannedWorkout);
router.get('/me', getUserPlannedWorkouts);
router.delete('/:id', deletePlannedWorkout);

export default router;