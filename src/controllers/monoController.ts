import { Request, Response } from 'express';
import { prisma } from '../db';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';
import * as monoService from '../services/monoService';
import { getCategoryByMcc } from '../utils/mccMapper';

export const syncMonoAccounts = catchAsync(async (req: Request, res: Response) => {
    const monoData = await monoService.getMonoUserInfo();

    const accounts = monoData.accounts.map((acc: any) => ({
        mono_account_id: acc.id,
        type: acc.type,
        currencyCode: acc.currencyCode,
        balance: acc.balance / 100
    }));

    res.json(accounts);
});

export const linkAccount = catchAsync(async (req: Request, res: Response) => {
    const userId = Number((req as any).user.userId);
    const { account_id, mono_account_id } = req.body;

    const updatedAccount = await prisma.account.updateMany({
        where: {
            account_id: Number(account_id),
            user_id: userId
        },
        data: { mono_account_id }
    });

    if (updatedAccount.count === 0) {
        throw new AppError('Account not found or access denied', 404);
    }

    res.json({ status: 'success', message: 'Account linked successfully' });
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

    if (!account) {
        return res.status(200).json({ message: 'Account not linked' });
    }

    const categoryName = getCategoryByMcc(mcc);

    let category = await prisma.category.findFirst({
        where: {
            user_id: account.user_id,
            name: categoryName
        }
    });

    if (!category) {
        category = await prisma.category.create({
            data: {
                user_id: account.user_id,
                name: categoryName,
                type: realAmount < 0 ? 'EXPENSE' : 'INCOME'
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