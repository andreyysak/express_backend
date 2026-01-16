"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMaintenanceByDescription = exports.getMaintenanceById = exports.deleteMaintenance = exports.updateMaintenance = exports.createMaintenance = exports.getAllMaintenance = void 0;
const db_1 = require("../db");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../class/AppError");
exports.getAllMaintenance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const data = await db_1.prisma.maintenance.findMany({
        where: { user_id: userId },
        orderBy: { date: 'desc' }
    });
    res.json(data);
});
exports.createMaintenance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { date, description, odometer } = req.body;
    const item = await db_1.prisma.maintenance.create({
        data: {
            user_id: userId,
            date: new Date(date),
            description,
            odometer
        }
    });
    res.status(201).json(item);
});
exports.updateMaintenance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const id = Number(req.params.id);
    const result = await db_1.prisma.maintenance.updateMany({
        where: {
            maintenance_id: id,
            user_id: userId
        },
        data: req.body
    });
    if (result.count === 0) {
        throw new AppError_1.AppError('Maintenance record not found or access denied', 404);
    }
    const updatedItem = await db_1.prisma.maintenance.findUnique({
        where: { maintenance_id: id }
    });
    res.json(updatedItem);
});
exports.deleteMaintenance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const id = Number(req.params.id);
    const result = await db_1.prisma.maintenance.deleteMany({
        where: {
            maintenance_id: id,
            user_id: userId
        }
    });
    if (result.count === 0) {
        throw new AppError_1.AppError('Maintenance record not found or access denied', 404);
    }
    res.status(204).send();
});
exports.getMaintenanceById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const id = Number(req.params.id);
    const item = await db_1.prisma.maintenance.findFirst({
        where: {
            maintenance_id: id,
            user_id: userId
        }
    });
    if (!item) {
        throw new AppError_1.AppError('Maintenance record not found', 404);
    }
    res.json(item);
});
exports.searchMaintenanceByDescription = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { keyword } = req.query;
    if (!keyword) {
        throw new AppError_1.AppError('Search keyword is required', 400);
    }
    const data = await db_1.prisma.maintenance.findMany({
        where: {
            user_id: userId,
            description: { contains: String(keyword), mode: 'insensitive' }
        }
    });
    res.json(data);
});
