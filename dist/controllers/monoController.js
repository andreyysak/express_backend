"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.verifyWebhook = exports.linkAccount = exports.syncMonoAccounts = void 0;
const db_1 = require("../db");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../class/AppError");
const monoService = __importStar(require("../services/monoService"));
const mccMapper_1 = require("../utils/mccMapper");
exports.syncMonoAccounts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const monoData = await monoService.getMonoUserInfo();
    const accounts = monoData.accounts.map((acc) => ({
        mono_account_id: acc.id,
        type: acc.type,
        currencyCode: acc.currencyCode,
        balance: acc.balance / 100
    }));
    res.json(accounts);
});
exports.linkAccount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { account_id, mono_account_id } = req.body;
    const updatedAccount = await db_1.prisma.account.updateMany({
        where: {
            account_id: Number(account_id),
            user_id: userId
        },
        data: { mono_account_id }
    });
    if (updatedAccount.count === 0) {
        throw new AppError_1.AppError('Account not found or access denied', 404);
    }
    res.json({ status: 'success', message: 'Account linked successfully' });
});
exports.verifyWebhook = (0, catchAsync_1.catchAsync)(async (req, res) => {
    res.status(200).send('ok');
});
exports.handleWebhook = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { data } = req.body;
    if (!data || !data.statementItem) {
        return res.status(200).json({ message: 'No data' });
    }
    const { account: monoAccountId, statementItem } = data;
    const { amount, description, time, mcc } = statementItem;
    const realAmount = amount / 100;
    const account = await db_1.prisma.account.findUnique({
        where: { mono_account_id: monoAccountId }
    });
    if (!account) {
        return res.status(200).json({ message: 'Account not linked' });
    }
    const categoryName = (0, mccMapper_1.getCategoryByMcc)(mcc);
    let category = await db_1.prisma.category.findFirst({
        where: {
            user_id: account.user_id,
            name: categoryName
        }
    });
    if (!category) {
        category = await db_1.prisma.category.create({
            data: {
                user_id: account.user_id,
                name: categoryName,
                type: realAmount < 0 ? 'EXPENSE' : 'INCOME'
            }
        });
    }
    await db_1.prisma.$transaction([
        db_1.prisma.transaction.create({
            data: {
                user_id: account.user_id,
                account_id: account.account_id,
                category_id: category.category_id,
                amount: realAmount,
                description: description || `MCC: ${mcc}`,
                date: new Date(time * 1000)
            }
        }),
        db_1.prisma.account.update({
            where: { account_id: account.account_id },
            data: { balance: { increment: realAmount } }
        })
    ]);
    res.status(200).json({ status: 'success' });
});
