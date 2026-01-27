import { Request, Response } from 'express';
import logger from '../logger';
import { prisma } from '../db';

export const getExercises = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const exercises = await prisma.exercise.findMany({
            where: { user_id: Number(userId) },
            orderBy: { name: 'asc' }
        });
        res.json(exercises);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createExercise = async (req: Request, res: Response) => {
    try {
        const { user_id, name, category, equipment } = req.body;
        const exercise = await prisma.exercise.create({
            data: { user_id, name, category, equipment }
        });
        res.status(201).json(exercise);
    } catch (error: any) {
        logger.error(`Помилка створення вправи: ${error.message}`);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
};

export const deleteExercise = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.exercise.delete({
            where: { exercise_id: Number(id) }
        });
        res.json({ message: 'Exercise deleted' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
};