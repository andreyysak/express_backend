"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripsByDirection = exports.getTripById = exports.deleteTrip = exports.updateTrip = exports.createTrip = exports.getAllTrips = void 0;
const db_1 = require("../db");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../class/AppError");
const getUserTelegramId = async (userId) => {
    const user = await db_1.prisma.user.findUnique({
        where: { user_id: userId },
        select: { telegram_user_id: true }
    });
    if (!user)
        throw new AppError_1.AppError('User not found', 404);
    return user.telegram_user_id;
};
exports.getAllTrips = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const telegram_user_id = await getUserTelegramId(userId);
    const data = await db_1.prisma.trip.findMany({
        where: { telegram_user_id },
        orderBy: { created_at: 'desc' }
    });
    res.json(data);
});
exports.createTrip = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const telegram_user_id = await getUserTelegramId(userId);
    const { kilometrs, direction } = req.body;
    const item = await db_1.prisma.trip.create({
        data: {
            telegram_user_id,
            kilometrs,
            direction
        }
    });
    res.status(201).json(item);
});
exports.updateTrip = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const telegram_user_id = await getUserTelegramId(userId);
    const id = Number(req.params.id);
    const result = await db_1.prisma.trip.updateMany({
        where: {
            trip_id: id,
            telegram_user_id
        },
        data: req.body
    });
    if (result.count === 0) {
        throw new AppError_1.AppError('Trip not found or access denied', 404);
    }
    const updatedItem = await db_1.prisma.trip.findUnique({
        where: { trip_id: id }
    });
    res.json(updatedItem);
});
exports.deleteTrip = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const telegram_user_id = await getUserTelegramId(userId);
    const id = Number(req.params.id);
    const result = await db_1.prisma.trip.deleteMany({
        where: {
            trip_id: id,
            telegram_user_id
        }
    });
    if (result.count === 0) {
        throw new AppError_1.AppError('Trip not found or access denied', 404);
    }
    res.status(204).send();
});
exports.getTripById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const telegram_user_id = await getUserTelegramId(userId);
    const id = Number(req.params.id);
    const item = await db_1.prisma.trip.findFirst({
        where: {
            trip_id: id,
            telegram_user_id
        }
    });
    if (!item) {
        throw new AppError_1.AppError('Trip not found', 404);
    }
    res.json(item);
});
exports.getTripsByDirection = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const telegram_user_id = await getUserTelegramId(userId);
    const { query } = req.query;
    if (!query) {
        throw new AppError_1.AppError('Search query is required', 400);
    }
    const data = await db_1.prisma.trip.findMany({
        where: {
            telegram_user_id,
            direction: { contains: String(query), mode: 'insensitive' }
        }
    });
    res.json(data);
});
