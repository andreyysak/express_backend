"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateAccount = exports.createAccount = exports.getAccount = exports.getAccounts = void 0;
const db_1 = require("../db");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../class/AppError");
exports.getAccounts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const accounts = await db_1.prisma.account.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
    });
    res.json(accounts);
});
exports.getAccount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { id } = req.params;
    const account = await db_1.prisma.account.findFirst({
        where: {
            account_id: Number(id),
            user_id: userId
        }
    });
    if (!account) {
        throw new AppError_1.AppError('Account not found', 404);
    }
    res.json(account);
});
exports.createAccount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { name, currency, balance } = req.body;
    const account = await db_1.prisma.account.create({
        data: {
            user_id: userId,
            name,
            currency: currency || 'UAH',
            balance: balance || 0
        }
    });
    res.status(201).json(account);
});
exports.updateAccount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { id } = req.params;
    const { name, currency, balance } = req.body;
    const account = await db_1.prisma.account.updateMany({
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
        throw new AppError_1.AppError('Account not found or you do not have permission', 404);
    }
    const updatedAccount = await db_1.prisma.account.findUnique({
        where: { account_id: Number(id) }
    });
    res.json(updatedAccount);
});
exports.deleteAccount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { id } = req.params;
    const account = await db_1.prisma.account.deleteMany({
        where: {
            account_id: Number(id),
            user_id: userId
        }
    });
    if (account.count === 0) {
        throw new AppError_1.AppError('Account not found or you do not have permission', 404);
    }
    res.status(204).send();
});
