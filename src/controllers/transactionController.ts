import { Request, Response } from 'express';
import { prisma } from "../db";
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';

export const getTransactions = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);

    const transactions = await prisma.transaction.findMany({
        where: { user_id: userId },
        include: {
            account: { select: { name: true, currency: true } },
            category: { select: { name: true, type: true } }
        },
        orderBy: { date: 'desc' }
    });

    res.json(transactions);
});

export const createTransaction = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { account_id, category_id, amount, description, date } = req.body;

    const account = await prisma.account.findFirst({
        where: { account_id: Number(account_id), user_id: userId }
    });

    if (!account) {
        throw new AppError('Account not found or access denied', 404);
    }

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
});

export const deleteTransaction = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const id = Number(req.params.id);

    const transaction = await prisma.transaction.findFirst({
        where: { transaction_id: id, user_id: userId }
    });

    if (!transaction) {
        throw new AppError('Transaction not found', 404);
    }

    await prisma.$transaction([
        prisma.account.update({
            where: { account_id: transaction.account_id },
            data: { balance: { decrement: transaction.amount } }
        }),
        prisma.transaction.delete({
            where: { transaction_id: id }
        })
    ]);

    res.status(204).send();
});