"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFuelByStation = exports.getFuelById = exports.deleteFuel = exports.updateFuel = exports.createFuel = exports.getAllFuel = void 0;
const db_1 = require("../db");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../class/AppError");
exports.getAllFuel = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const data = await db_1.prisma.fuel.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
    });
    res.json(data);
});
exports.createFuel = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { liters, price, station } = req.body;
    const item = await db_1.prisma.fuel.create({
        data: {
            user_id: userId,
            liters,
            price,
            station
        }
    });
    res.status(201).json(item);
});
exports.updateFuel = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const id = Number(req.params.id);
    const result = await db_1.prisma.fuel.updateMany({
        where: {
            gas_id: id,
            user_id: userId
        },
        data: req.body
    });
    if (result.count === 0) {
        throw new AppError_1.AppError('Fuel record not found or access denied', 404);
    }
    const updatedItem = await db_1.prisma.fuel.findUnique({
        where: { gas_id: id }
    });
    res.json(updatedItem);
});
exports.deleteFuel = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const id = Number(req.params.id);
    const result = await db_1.prisma.fuel.deleteMany({
        where: {
            gas_id: id,
            user_id: userId
        }
    });
    if (result.count === 0) {
        throw new AppError_1.AppError('Fuel record not found or access denied', 404);
    }
    res.status(204).send();
});
exports.getFuelById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const id = Number(req.params.id);
    const item = await db_1.prisma.fuel.findFirst({
        where: {
            gas_id: id,
            user_id: userId
        }
    });
    if (!item) {
        throw new AppError_1.AppError('Fuel record not found', 404);
    }
    res.json(item);
});
exports.searchFuelByStation = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { station } = req.query;
    if (!station) {
        throw new AppError_1.AppError('Station query parameter is required', 400);
    }
    const data = await db_1.prisma.fuel.findMany({
        where: {
            user_id: userId,
            station: { contains: String(station), mode: 'insensitive' }
        }
    });
    res.json(data);
});
