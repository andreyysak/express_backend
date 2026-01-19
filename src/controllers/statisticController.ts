import { Request, Response } from 'express';
import { prisma } from "../db";
import {sendDashboardToTelegram} from "../services/telegramService";

export const getFullStatistics = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: 'Month and year are required' });

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

        const [transactions, fuelEntries, trips] = await Promise.all([
            prisma.transaction.findMany({ where: { date: { gte: startDate, lte: endDate } }, include: { category: true } }),
            prisma.fuel.findMany({ where: { created_at: { gte: startDate, lte: endDate } } }),
            prisma.trip.findMany({ where: { created_at: { gte: startDate, lte: endDate } } })
        ]);

        const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const totalFuelCost = fuelEntries.reduce((sum, f) => sum + f.price, 0);
        const totalDistance = trips.reduce((sum, t) => sum + t.kilometrs, 0);

        res.json({
            period: `${month}/${year}`,
            finance: { totalSpent, totalIncome, count: transactions.length },
            auto: { fuelCost: totalFuelCost, distance: totalDistance, tripsCount: trips.length }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTripStatistics = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

        const trips = await prisma.trip.findMany({
            where: { created_at: { gte: startDate, lte: endDate } },
            orderBy: { created_at: 'desc' }
        });

        const totalKm = trips.reduce((sum, t) => sum + t.kilometrs, 0);
        const directionStats = trips.reduce((acc: any, t) => {
            acc[t.direction] = (acc[t.direction] || 0) + t.kilometrs;
            return acc;
        }, {});

        res.json({ totalKilometrs: totalKm, tripsCount: trips.length, directionStats, history: trips });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCarEfficiency = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

        const [fuel, trips] = await Promise.all([
            prisma.fuel.aggregate({ _sum: { price: true, liters: true }, where: { created_at: { gte: startDate, lte: endDate } } }),
            prisma.trip.aggregate({ _sum: { kilometrs: true }, where: { created_at: { gte: startDate, lte: endDate } } })
        ]);

        const cost = fuel._sum.price || 0;
        const kms = trips._sum.kilometrs || 0;
        const liters = fuel._sum.liters || 0;

        res.json({
            costPerKm: kms > 0 ? (cost / kms).toFixed(2) : 0,
            avgConsumption: kms > 0 ? ((liters / kms) * 100).toFixed(2) : 0,
            totalSpentOnCar: cost,
            totalDistance: kms
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTopCategories = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const result = await prisma.transaction.groupBy({
            by: ['category_id'],
            _sum: { amount: true },
            where: { amount: { lt: 0 }, date: { gte: new Date(Number(year), Number(month) - 1, 1), lte: new Date(Number(year), Number(month), 0, 23, 59, 59) } },
            orderBy: { _sum: { amount: 'asc' } },
            take: 5
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDailySpendingTrend = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const transactions = await prisma.transaction.findMany({
            where: { date: { gte: new Date(Number(year), Number(month) - 1, 1), lte: new Date(Number(year), Number(month), 0, 23, 59, 59) } },
            select: { date: true, amount: true }
        });

        const dailyMap: { [key: string]: number } = {};
        transactions.forEach(t => {
            const dateStr = t.date.toISOString().split('T')[0];
            dailyMap[dateStr] = (dailyMap[dateStr] || 0) + t.amount;
        });

        res.json(dailyMap);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getWeekdayStats = async (req: Request, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({ where: { amount: { lt: 0 } }, select: { date: true, amount: true } });
        const weekdayMap: { [key: string]: number } = {};
        transactions.forEach(t => {
            const day = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(t.date);
            weekdayMap[day] = (weekdayMap[day] || 0) + Math.abs(t.amount);
        });
        res.json(weekdayMap);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getFuelPriceExtremes = async (req: Request, res: Response) => {
    try {
        const prices = await prisma.fuel.aggregate({ _min: { price: true }, _max: { price: true }, _avg: { price: true } });
        res.json(prices);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSpendingAnomalies = async (req: Request, res: Response) => {
    try {
        const avgResult = await prisma.transaction.aggregate({ _avg: { amount: true }, where: { amount: { lt: 0 } } });
        const threshold = (avgResult._avg.amount || 0) * 3;
        const anomalies = await prisma.transaction.findMany({ where: { amount: { lt: threshold } }, orderBy: { amount: 'asc' } });
        res.json(anomalies);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSavingsRate = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

        const transactions = await prisma.transaction.findMany({ where: { date: { gte: startDate, lte: endDate } } });
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

        res.json({ income, expense, savings: income - expense, rate: income > 0 ? ((income - expense) / income * 100).toFixed(2) + '%' : '0%' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMaintenanceCostIndex = async (req: Request, res: Response) => {
    try {
        const totalMaint = await prisma.maintenance.aggregate({ _sum: { odometer: true } });
        res.json({ totalMaintenanceMileage: totalMaint._sum.odometer || 0 });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getFavoriteStations = async (req: Request, res: Response) => {
    try {
        const stats = await prisma.fuel.groupBy({ by: ['station'], _count: { gas_id: true }, orderBy: { _count: { gas_id: 'desc' } } });
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSpendingForecast = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
        const currentDay = (now.getMonth() + 1 === Number(month)) ? now.getDate() : daysInMonth;

        const transactions = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { amount: { lt: 0 }, date: { gte: new Date(Number(year), Number(month) - 1, 1), lte: now } }
        });

        const spentSoFar = Math.abs(transactions._sum.amount || 0);
        const forecast = (spentSoFar / currentDay) * daysInMonth;
        res.json({ spentSoFar, forecast: forecast.toFixed(2) });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTripTimeStats = async (req: Request, res: Response) => {
    try {
        const trips = await prisma.trip.findMany({ select: { created_at: true } });
        const timeStats = { Morning: 0, Day: 0, Evening: 0, Night: 0 };
        trips.forEach(t => {
            const hour = t.created_at.getHours();
            if (hour >= 6 && hour < 12) timeStats.Morning++;
            else if (hour >= 12 && hour < 18) timeStats.Day++;
            else if (hour >= 18 && hour < 24) timeStats.Evening++;
            else timeStats.Night++;
        });
        res.json(timeStats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTripWorkdayVsWeekend = async (req: Request, res: Response) => {
    try {
        const trips = await prisma.trip.findMany();
        const stats = { Workday: 0, Weekend: 0 };
        trips.forEach(t => {
            const day = t.created_at.getDay();
            if (day === 0 || day === 6) stats.Weekend += t.kilometrs;
            else stats.Workday += t.kilometrs;
        });
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTripExtremes = async (req: Request, res: Response) => {
    try {
        const result = await prisma.trip.aggregate({ _max: { kilometrs: true }, _min: { kilometrs: true }, _avg: { kilometrs: true } });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getWeeklyMileageTrend = async (req: Request, res: Response) => {
    try {
        const trips = await prisma.trip.findMany({ orderBy: { created_at: 'asc' } });
        const weeklyStats: { [key: string]: number } = {};
        trips.forEach(t => {
            const date = new Date(t.created_at);
            const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
            const label = `Week ${weekNum} of ${date.getMonth() + 1}`;
            weeklyStats[label] = (weeklyStats[label] || 0) + t.kilometrs;
        });
        res.json(weeklyStats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTopDirections = async (req: Request, res: Response) => {
    try {
        const result = await prisma.trip.groupBy({ by: ['direction'], _count: { trip_id: true }, _sum: { kilometrs: true }, orderBy: { _count: { trip_id: 'desc' } }, take: 5 });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCarUsageFrequency = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const trips = await prisma.trip.findMany({
            where: { created_at: { gte: new Date(Number(year), Number(month) - 1, 1), lte: new Date(Number(year), Number(month), 0, 23, 59, 59) } },
            select: { created_at: true }
        });
        const uniqueDays = new Set(trips.map(t => t.created_at.toDateString()));
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
        res.json({ activeDays: uniqueDays.size, usagePercentage: ((uniqueDays.size / daysInMonth) * 100).toFixed(2) + "%" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const sendTelegramReport = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: 'Month and year are required' });

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

        const [transactions, fuel, trips, topDirections] = await Promise.all([
            prisma.transaction.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
            prisma.fuel.aggregate({ _sum: { price: true }, where: { created_at: { gte: startDate, lte: endDate } } }),
            prisma.trip.aggregate({ _sum: { kilometrs: true }, where: { created_at: { gte: startDate, lte: endDate } } }),
            prisma.trip.groupBy({
                by: ['direction'],
                _sum: { kilometrs: true },
                where: { created_at: { gte: startDate, lte: endDate } },
                orderBy: { _sum: { kilometrs: 'desc' } },
                take: 3
            })
        ]);

        const spent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const kms = trips._sum.kilometrs || 0;
        const fuelCost = fuel._sum.price || 0;

        const dashboardData = {
            period: `${month}/${year}`,
            finance: {
                totalSpent: spent.toFixed(2),
                totalIncome: income.toFixed(2),
                savingsRate: income > 0 ? ((income - spent) / income * 100).toFixed(2) + '%' : '0%',
                forecast: 'Розраховується...',
                anomaliesCount: 0
            },
            auto: {
                distance: kms,
                fuelCost: fuelCost,
                costPerKm: kms > 0 ? (fuelCost / kms).toFixed(2) : 0,
                usageFrequency: 'За запитом',
                topDirections: topDirections
            }
        };

        await sendDashboardToTelegram(dashboardData);
        res.json({ message: 'Real dashboard data sent to Telegram', data: dashboardData });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};