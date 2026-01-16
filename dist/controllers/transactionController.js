"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.createTransaction = exports.getTransactions = void 0;
const db_1 = require("../db");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../class/AppError");
exports.getTransactions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const transactions = await db_1.prisma.transaction.findMany({
        where: { user_id: userId },
        include: {
            account: { select: { name: true, currency: true } },
            category: { select: { name: true, type: true } }
        },
        orderBy: { date: 'desc' }
    });
    res.json(transactions);
});
exports.createTransaction = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { account_id, category_id, amount, description, date } = req.body;
    const account = await db_1.prisma.account.findFirst({
        where: { account_id: Number(account_id), user_id: userId }
    });
    if (!account) {
        throw new AppError_1.AppError('Account not found or access denied', 404);
    }
    const [transaction] = await db_1.prisma.$transaction([
        db_1.prisma.transaction.create({
            data: {
                user_id: userId,
                account_id: Number(account_id),
                category_id: Number(category_id),
                amount: Number(amount),
                description,
                date: date ? new Date(date) : new Date()
            }
        }),
        db_1.prisma.account.update({
            where: { account_id: Number(account_id) },
            data: { balance: { increment: Number(amount) } }
        })
    ]);
    res.status(201).json(transaction);
});
exports.deleteTransaction = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const id = Number(req.params.id);
    const transaction = await db_1.prisma.transaction.findFirst({
        where: { transaction_id: id, user_id: userId }
    });
    if (!transaction) {
        throw new AppError_1.AppError('Transaction not found', 404);
    }
    await db_1.prisma.$transaction([
        db_1.prisma.account.update({
            where: { account_id: transaction.account_id },
            data: { balance: { decrement: transaction.amount } }
        }),
        db_1.prisma.transaction.delete({
            where: { transaction_id: id }
        })
    ]);
    res.status(204).send();
});
