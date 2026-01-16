import { Request, Response } from 'express';
import { prisma } from "../db";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);
        const categories = await prisma.category.findMany({
            where: { user_id: userId },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        const category = await prisma.category.create({
            data: {
                user_id: userId,
                name,
                type // INCOME or EXPENSE
            }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);
        const { id } = req.params;

        await prisma.category.delete({
            where: {
                category_id: Number(id),
                user_id: userId
            }
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
};