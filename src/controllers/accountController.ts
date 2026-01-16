import { Request, Response } from 'express';
import { prisma } from "../db";
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';

export const getAccounts = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);

    const accounts = await prisma.account.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
    });

    res.json(accounts);
});

export const getAccount = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { id } = req.params;

    const account = await prisma.account.findFirst({
        where: {
            account_id: Number(id),
            user_id: userId
        }
    });

    if (!account) {
        throw new AppError('Account not found', 404);
    }

    res.json(account);
});

export const createAccount = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
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
});

export const updateAccount = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { id } = req.params;
    const { name, currency, balance } = req.body;

    const account = await prisma.account.updateMany({
        where: {
            account_id: Number(id),
            user_id: userId
        },
        data: {
            name,
            currency,
            balance
        }
    });

    if (account.count === 0) {
        throw new AppError('Account not found or you do not have permission', 404);
    }

    const updatedAccount = await prisma.account.findUnique({
        where: { account_id: Number(id) }
    });

    res.json(updatedAccount);
});

export const deleteAccount = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { id } = req.params;

    const account = await prisma.account.deleteMany({
        where: {
            account_id: Number(id),
            user_id: userId
        }
    });

    if (account.count === 0) {
        throw new AppError('Account not found or you do not have permission', 404);
    }

    res.status(204).send();
});