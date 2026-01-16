import cron from 'node-cron';
import { prisma } from "../db";
import { sendDashboardToTelegram } from './telegramService';
import { runAllParsers } from '../parsers';

export const initCronJobs = () => {
    cron.schedule('0 8 * * *', async () => {
        console.log('⛽️💰 Запуск щоденного парсингу цін та валют...');
        try {
            const data = await runAllParsers();

            // Збереження пального
            const fuelToSave: any[] = [];
            if (data.okko?.prices) {
                data.okko.prices.forEach((p: any) => fuelToSave.push({ station: 'OKKO', fuel_type: p.fuelType, price: p.price }));
            }
            if (data.wog?.prices) {
                data.wog.prices.forEach((p: any) => fuelToSave.push({ station: 'WOG', fuel_type: p.fuelType, price: p.price }));
            }

            // Збереження валюти
            const currencyToSave: any[] = [];
            if (data.currency?.rates) {
                data.currency.rates.forEach((r: any) => {
                    currencyToSave.push({
                        code: r.code,
                        rate_buy: r.buy,
                        rate_sell: r.sell
                    });
                });
            }

            await Promise.all([
                fuelToSave.length > 0 ? prisma.fuelPriceHistory.createMany({ data: fuelToSave }) : Promise.resolve(),
                currencyToSave.length > 0 ? prisma.currencyHistory.createMany({ data: currencyToSave }) : Promise.resolve()
            ]);

            console.log('✅ Всі дані успішно оновлено');
        } catch (error) {
            console.error('❌ Помилка в Cron Job:', error);
        }
    });

    cron.schedule('0 9 * * 1', async () => {
        console.log('⏳ Запуск щотижневого звіту...');

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const [transactions, fuel, trips] = await Promise.all([
                prisma.transaction.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
                prisma.fuel.aggregate({ _sum: { price: true, liters: true }, where: { created_at: { gte: startDate, lte: endDate } } }),
                prisma.trip.aggregate({ _sum: { kilometrs: true }, where: { created_at: { gte: startDate, lte: endDate } } })
            ]);

            const spent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

            const dashboardData = {
                period: `${month}/${year} (Weekly Auto-Report)`,
                finance: {
                    totalSpent: spent.toFixed(2),
                    totalIncome: income.toFixed(2),
                    savingsRate: income > 0 ? ((income - spent) / income * 100).toFixed(2) + '%' : '0%',
                    forecast: 'Calculated at end of month',
                    anomaliesCount: 0
                },
                auto: {
                    distance: trips._sum.kilometrs || 0,
                    fuelCost: fuel._sum.price || 0,
                    costPerKm: (trips._sum.kilometrs || 0) > 0 ? ((fuel._sum.price || 0) / (trips._sum.kilometrs || 0)).toFixed(2) : 0,
                    usageFrequency: 'Weekly auto-check',
                    topDirections: []
                }
            };

            await sendDashboardToTelegram(dashboardData);
            console.log('✅ Звіт успішно надіслано в Telegram');
        } catch (error) {
            console.error('❌ Помилка в Cron Job:', error);
        }
    });
};