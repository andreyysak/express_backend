import { Request, Response } from 'express';
import { prisma } from '../db';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';
import * as monoService from '../services/monoService';
import { getCategoryByMcc } from '../utils/mccMapper';

export const syncMonoAccounts = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const monoData = await monoService.getMonoUserInfo();

    const savedAccounts = [];

    for (const acc of monoData.accounts) {
        const currencyMap: Record<number, string> = { 980: 'UAH', 840: 'USD', 978: 'EUR' };
        const currency = currencyMap[acc.currencyCode] || 'UAH';

        const account = await prisma.account.upsert({
            where: { mono_account_id: acc.id },
            update: {
                balance: acc.balance / 100,
            },
            create: {
                user_id: userId,
                mono_account_id: acc.id,
                name: `Mono ${acc.type} (${currency})`,
                balance: acc.balance / 100,
                currency: currency
            }
        });
        savedAccounts.push(account);
    }

    res.json(savedAccounts);
});

export const syncTransactions = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { account_id, days = 31 } = req.body;

    const account = await prisma.account.findUnique({
        where: { account_id: Number(account_id) }
    });

    if (!account || !account.mono_account_id) {
        throw new AppError('Account not found or not linked to Mono', 404);
    }

    const to = Math.floor(Date.now() / 1000);
    const from = romanticToUnix(days);

    const statements = await monoService.getStatements(account.mono_account_id, from, to);

    for (const item of statements) {
        const realAmount = item.amount / 100;
        const categoryName = getCategoryByMcc(item.mcc);

        let category = await prisma.category.findFirst({
            where: { user_id: userId, name: categoryName }
        });

        if (!category) {
            category = await prisma.category.create({
                data: {
                    user_id: userId,
                    name: categoryName,
                    type: realAmount < 0 ? 'EXPENSE' : 'INCOME'
                }
            });
        }

        await prisma.transaction.upsert({
            where: { transaction_id: -1 }, // Тут краще мати унікальний ID транзакції від Mono
            create: {
                user_id: userId,
                account_id: account.account_id,
                category_id: category.category_id,
                amount: realAmount,
                description: item.description || `MCC: ${item.mcc}`,
                date: new Date(item.time * 1000)
            },
            update: {}
        });
    }

    res.json({ status: 'success', imported: statements.length });
});

export const linkAccount = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { account_id, mono_account_id } = req.body;

    const updatedAccount = await prisma.account.update({
        where: { account_id: Number(account_id) },
        data: {
            mono_account_id,
            user_id: userId
        }
    });

    res.json({ status: 'success', data: updatedAccount });
});

export const verifyWebhook = catchAsync(async (req: Request, res: Response) => {
    res.status(200).send('ok');
});

export const handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const { data } = req.body;

    if (!data || !data.statementItem) {
        return res.status(200).json({ message: 'No data' });
    }

    const { account: monoAccountId, statementItem } = data;
    const { amount, description, time, mcc } = statementItem;
    const realAmount = amount / 100;

    const account = await prisma.account.findUnique({
        where: { mono_account_id: monoAccountId }
    });

    if (!account) return res.status(200).json({ message: 'Account not linked' });

    const categoryName = getCategoryByMcc(mcc);

    let category = await prisma.category.findFirst({
        where: { user_id: account.user_id, name: categoryName }
    });

    if (!category) {
        category = await prisma.category.create({
            data: {
                user_id: account.user_id,
                name: categoryName,
                type: realAmount < 0 ? 'EXPENSE' : 'INCOME',
            }
        });
    }

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                user_id: account.user_id,
                account_id: account.account_id,
                category_id: category.category_id,
                amount: realAmount,
                description: description || `MCC: ${mcc}`,
                date: new Date(time * 1000)
            }
        }),
        prisma.account.update({
            where: { account_id: account.account_id },
            data: { balance: { increment: realAmount } }
        })
    ]);

    res.status(200).json({ status: 'success' });
});

const romanticToUnix = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return Math.floor(date.getTime() / 1000);
};