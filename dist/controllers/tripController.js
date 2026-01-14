"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripsByDirection = exports.getTripById = exports.deleteTrip = exports.updateTrip = exports.createTrip = exports.getAllTrips = void 0;
const db_1 = require("../db");
const getAllTrips = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db_1.prisma.user.findUnique({ where: { user_id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const data = await db_1.prisma.trip.findMany({
            where: { telegram_user_id: user.telegram_user_id }
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
};
exports.getAllTrips = getAllTrips;
const createTrip = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db_1.prisma.user.findUnique({ where: { user_id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const { kilometrs, direction } = req.body;
        const item = await db_1.prisma.trip.create({
            data: {
                telegram_user_id: user.telegram_user_id,
                kilometrs,
                direction
            }
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating trip' });
    }
};
exports.createTrip = createTrip;
const updateTrip = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db_1.prisma.user.findUnique({ where: { user_id: userId } });
        const item = await db_1.prisma.trip.update({
            where: {
                trip_id: Number(req.params.id),
                telegram_user_id: user?.telegram_user_id
            },
            data: req.body
        });
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: 'Update failed or access denied' });
    }
};
exports.updateTrip = updateTrip;
const deleteTrip = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db_1.prisma.user.findUnique({ where: { user_id: userId } });
        await db_1.prisma.trip.delete({
            where: {
                trip_id: Number(req.params.id),
                telegram_user_id: user?.telegram_user_id
            }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Delete failed or access denied' });
    }
};
exports.deleteTrip = deleteTrip;
const getTripById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db_1.prisma.user.findUnique({ where: { user_id: userId } });
        const item = await db_1.prisma.trip.findFirst({
            where: {
                trip_id: Number(req.params.id),
                telegram_user_id: user?.telegram_user_id
            }
        });
        if (!item)
            return res.status(404).json({ error: 'Trip not found' });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getTripById = getTripById;
const getTripsByDirection = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db_1.prisma.user.findUnique({ where: { user_id: userId } });
        const { query } = req.query;
        const data = await db_1.prisma.trip.findMany({
            where: {
                telegram_user_id: user?.telegram_user_id,
                direction: { contains: String(query), mode: 'insensitive' }
            }
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};
exports.getTripsByDirection = getTripsByDirection;
