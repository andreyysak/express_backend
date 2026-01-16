import { Request, Response } from 'express';
import { prisma } from "../db";
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';

export const getCategories = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const categories = await prisma.category.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' }
    });
    res.json(categories);
});

export const getCategory = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { id } = req.params;

    const category = await prisma.category.findFirst({
        where: {
            category_id: Number(id),
            user_id: userId
        }
    });

    if (!category) {
        throw new AppError('Category not found', 404);
    }

    res.json(category);
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { name, type } = req.body;

    const category = await prisma.category.create({
        data: {
            user_id: userId,
            name,
            type
        }
    });
    res.status(201).json(category);
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { id } = req.params;

    const result = await prisma.category.deleteMany({
        where: {
            category_id: Number(id),
            user_id: userId
        }
    });

    if (result.count === 0) {
        throw new AppError('Category not found or you do not have permission', 404);
    }

    res.status(204).send();
});