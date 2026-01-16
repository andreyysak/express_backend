import { Request, Response } from 'express';
import { prisma } from "../db";

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);
        const transactions = await prisma.transaction.findMany({
            where: { user_id: userId },
            include: {
                account: { select: { name: true } },
                category: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);
        const { account_id, category_id, amount, description, date } = req.body;

        const [transaction] = await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    user_id: userId,
                    account_id: Number(account_id),
                    category_id: Number(category_id),
                    amount: Number(amount),
                    description,
                    date: date ? new Date(date) : new Date()
                }
            }),
            prisma.account.update({
                where: { account_id: Number(account_id) },
                data: { balance: { increment: Number(amount) } }
            })
        ]);

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Transaction failed' });
    }
};