"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = exports.getCategory = exports.getCategories = void 0;
const db_1 = require("../db");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../class/AppError");
exports.getCategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const categories = await db_1.prisma.category.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' }
    });
    res.json(categories);
});
exports.getCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { id } = req.params;
    const category = await db_1.prisma.category.findFirst({
        where: {
            category_id: Number(id),
            user_id: userId
        }
    });
    if (!category) {
        throw new AppError_1.AppError('Category not found', 404);
    }
    res.json(category);
});
exports.createCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { name, type } = req.body;
    const category = await db_1.prisma.category.create({
        data: {
            user_id: userId,
            name,
            type
        }
    });
    res.status(201).json(category);
});
exports.deleteCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = Number(req.user.userId);
    const { id } = req.params;
    const result = await db_1.prisma.category.deleteMany({
        where: {
            category_id: Number(id),
            user_id: userId
        }
    });
    if (result.count === 0) {
        throw new AppError_1.AppError('Category not found or you do not have permission', 404);
    }
    res.status(204).send();
});
