import { Request, Response } from 'express';
import {prisma} from "../db";

export const getFullStatistics = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

        const transactions = await prisma.transaction.findMany({
            where: {
                date: { gte: startDate, lte: endDate }
            },
            include: { category: true }
        });

        const fuelEntries = await prisma.fuel.findMany({
            where: {
                created_at: { gte: startDate, lte: endDate }
            }
        });

        const trips = await prisma.trip.findMany({
            where: {
                created_at: { gte: startDate, lte: endDate }
            }
        });

        const totalSpent = transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalIncome = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalFuelCost = fuelEntries.reduce((sum, f) => sum + f.price, 0);
        const totalLiters = fuelEntries.reduce((sum, f) => sum + f.liters, 0);

        const totalDistance = trips.reduce((sum, t) => sum + t.kilometrs, 0);

        const stats = {
            period: `${month}/${year}`,
            finance: {
                totalSpent: Number(totalSpent.toFixed(2)),
                totalIncome: Number(totalIncome.toFixed(2)),
                count: transactions.length
            },
            auto: {
                fuelCost: Number(totalFuelCost.toFixed(2)),
                fuelLiters: Number(totalLiters.toFixed(2)),
                distance: Number(totalDistance.toFixed(2)),
                tripsCount: trips.length
            }
        };

        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};