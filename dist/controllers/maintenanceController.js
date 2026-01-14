"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMaintenanceByDescription = exports.getMaintenanceById = exports.deleteMaintenance = exports.updateMaintenance = exports.createMaintenance = exports.getAllMaintenance = void 0;
const db_1 = require("../db");
const getAllMaintenance = async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = await db_1.prisma.maintenance.findMany({
            where: { user_id: userId }
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch maintenance' });
    }
};
exports.getAllMaintenance = getAllMaintenance;
const createMaintenance = async (req, res) => {
    try {
        const userId = req.user.userId;
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
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating maintenance' });
    }
};
exports.createMaintenance = createMaintenance;
const updateMaintenance = async (req, res) => {
    try {
        const userId = req.user.userId;
        const item = await db_1.prisma.maintenance.update({
            where: {
                maintenance_id: Number(req.params.id),
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
exports.updateMaintenance = updateMaintenance;
const deleteMaintenance = async (req, res) => {
    try {
        const userId = req.user.userId;
        await db_1.prisma.maintenance.delete({
            where: {
                maintenance_id: Number(req.params.id),
                user_id: userId
            }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Delete failed or access denied' });
    }
};
exports.deleteMaintenance = deleteMaintenance;
const getMaintenanceById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const item = await db_1.prisma.maintenance.findFirst({
            where: {
                maintenance_id: Number(req.params.id),
                user_id: userId
            }
        });
        if (!item)
            return res.status(404).json({ error: 'Maintenance record not found' });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getMaintenanceById = getMaintenanceById;
const searchMaintenanceByDescription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { keyword } = req.query;
        const data = await db_1.prisma.maintenance.findMany({
            where: {
                user_id: userId,
                description: { contains: String(keyword), mode: 'insensitive' }
            }
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};
exports.searchMaintenanceByDescription = searchMaintenanceByDescription;
