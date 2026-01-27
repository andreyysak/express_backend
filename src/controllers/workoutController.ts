import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../logger';

const prisma = new PrismaClient();

export const createWorkout = async (req: Request, res: Response) => {
    try {
        const { user_id, name, notes, date, sets } = req.body;

        const workout = await prisma.workout.create({
            data: {
                user_id,
                name,
                notes,
                date: date ? new Date(date) : new Date(),
                sets: {
                    create: sets.map((set: any) => ({
                        exercise_id: set.exercise_id,
                        weight: set.weight,
                        reps: set.reps,
                        duration: set.duration,
                        distance: set.distance
                    }))
                }
            },
            include: {
                sets: true
            }
        });

        res.status(201).json(workout);
    } catch (error: any) {
        logger.error(`Помилка створення тренування: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserWorkouts = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const workouts = await prisma.workout.findMany({
            where: { user_id: Number(userId) },
            include: {
                sets: {
                    include: { exercise: true }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(workouts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteWorkout = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.workout.delete({
            where: { workout_id: Number(id) }
        });

        res.status(200).json({ message: 'Workout deleted successfully' });
    } catch (error: any) {
        logger.error(`Помилка видалення тренування: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
};

export const updateWorkout = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, notes, date, sets } = req.body;

        const updatedWorkout = await prisma.$transaction(async (tx) => {
            await tx.set.deleteMany({
                where: { workout_id: Number(id) }
            });

            return tx.workout.update({
                where: { workout_id: Number(id) },
                data: {
                    name,
                    notes,
                    date: date ? new Date(date) : undefined,
                    sets: {
                        create: sets.map((set: any) => ({
                            exercise_id: set.exercise_id,
                            weight: set.weight,
                            reps: set.reps,
                            duration: set.duration,
                            distance: set.distance
                        }))
                    }
                },
                include: { sets: true }
            });
        });

        res.json(updatedWorkout);
    } catch (error: any) {
        logger.error(`Помилка оновлення тренування: ${error.message}`);
        res.status(500).json({ error: 'Failed to update workout' });
    }
};