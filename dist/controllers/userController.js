"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateImage = exports.updateTelegramInfo = exports.updateLocation = exports.updatePhone = exports.updateEmail = exports.getMe = void 0;
const db_1 = require("../db");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../class/AppError");
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const user = await db_1.prisma.user.findUnique({
        where: { user_id: userId }
    });
    if (!user) {
        throw new AppError_1.AppError('Користувача не знайдено', 404);
    }
    res.json(user);
});
exports.updateEmail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { email } = req.body;
    const updatedUser = await db_1.prisma.user.update({
        where: { user_id: userId },
        data: { email }
    });
    res.json(updatedUser);
});
exports.updatePhone = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { phone } = req.body;
    const updatedUser = await db_1.prisma.user.update({
        where: { user_id: userId },
        data: { phone }
    });
    res.json(updatedUser);
});
exports.updateLocation = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { country, city } = req.body;
    const updatedUser = await db_1.prisma.user.update({
        where: { user_id: userId },
        data: { country, city }
    });
    res.json(updatedUser);
});
exports.updateTelegramInfo = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { telegram_name, telegram_username } = req.body;
    const updatedUser = await db_1.prisma.user.update({
        where: { user_id: userId },
        data: { telegram_name, telegram_username }
    });
    res.json(updatedUser);
});
exports.updateImage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { image } = req.body;
    const updatedUser = await db_1.prisma.user.update({
        where: { user_id: userId },
        data: { image }
    });
    res.json(updatedUser);
});
exports.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    await db_1.prisma.user.delete({
        where: { user_id: userId }
    });
    res.status(204).send();
});
