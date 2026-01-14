"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFuelByStation = exports.getFuelById = exports.deleteFuel = exports.updateFuel = exports.createFuel = exports.getAllFuel = void 0;
const db_1 = require("../db");
const getAllFuel = async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = await db_1.prisma.fuel.findMany({
            where: { user_id: userId }
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch fuel data' });
    }
};
exports.getAllFuel = getAllFuel;
const createFuel = async (req, res) => {
    try {
        const userId = req.user.userId;
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
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating fuel record' });
    }
};
exports.createFuel = createFuel;
const updateFuel = async (req, res) => {
    try {
        const userId = req.user.userId;
        const item = await db_1.prisma.fuel.update({
            where: {
                gas_id: Number(req.params.id),
                user_id: userId
            },
            data: req.body
        });
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: 'Update failed or access denied' });
    }
};
exports.updateFuel = updateFuel;
const deleteFuel = async (req, res) => {
    try {
        const userId = req.user.userId;
        await db_1.prisma.fuel.delete({
            where: {
                gas_id: Number(req.params.id),
                user_id: userId
            }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Delete failed or access denied' });
    }
};
exports.deleteFuel = deleteFuel;
const getFuelById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const item = await db_1.prisma.fuel.findFirst({
            where: {
                gas_id: Number(req.params.id),
                user_id: userId
            }
        });
        if (!item)
            return res.status(404).json({ error: 'Record not found' });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getFuelById = getFuelById;
const searchFuelByStation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { station } = req.query;
        const data = await db_1.prisma.fuel.findMany({
            where: {
                user_id: userId,
                station: { contains: String(station), mode: 'insensitive' }
            }
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};
exports.searchFuelByStation = searchFuelByStation;
