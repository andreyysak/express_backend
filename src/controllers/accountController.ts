import { Request, Response } from 'express';
import { prisma } from "../db";

export const getAccounts = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        if (!user || !user.userId) {
            return res.status(401).json({ error: 'Unauthorized: User ID missing' });
        }

        const accounts = await prisma.account.findMany({
            where: {
                user_id: Number(user.userId)
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: 'Error to fetch accounts' });
    }
};

export const createAccount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { name, currency, balance } = req.body;

        const account = await prisma.account.create({
            data: {
                user_id: userId,
                name,
                currency: currency || 'UAH',
                balance: balance || 0
            }
        });
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create account' });
    }
};
