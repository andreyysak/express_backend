import { Request, Response } from 'express';
import logger from '../logger';
import {prisma} from "../db";

export const createPlannedWorkout = async (req: Request, res: Response) => {
    try {
        const { title, scheduled_at, exercises, notes } = req.body;
        const userId = (req.user as any)?.userId;

        if (!userId || !title || !scheduled_at) {
            return res.status(400).json({ error: "Відсутні обов'язкові поля" });
        }

        const planned = await prisma.plannedWorkout.create({
            data: {
                user_id: Number(userId),
                title,
                scheduled_at: new Date(scheduled_at),
                exercises: exercises || [],
                notes,
                status: 'pending'
            }
        });

        res.status(201).json(planned);
    } catch (error: any) {
        logger.error(`Помилка створення плану: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const getUserPlannedWorkouts = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.userId;

        const planned = await prisma.plannedWorkout.findMany({
            where: { user_id: Number(userId) },
            orderBy: { scheduled_at: 'asc' }
        });

        res.json(planned);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePlannedWorkout = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.plannedWorkout.delete({
            where: { planned_workout_id: Number(id) }
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};