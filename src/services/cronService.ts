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
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); // Останні 7 днів
        const endDate = now;

        try {
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
                period: `За останній тиждень (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                finance: {
                    totalSpent: spent.toFixed(2),
                    totalIncome: income.toFixed(2),
                    savingsRate: income > 0 ? ((income - spent) / income * 100).toFixed(2) + '%' : '0%',
                    forecast: 'Наступний звіт через тиждень',
                    anomaliesCount: 0
                },
                auto: {
                    distance: kms,
                    fuelCost: fuelCost,
                    costPerKm: kms > 0 ? (fuelCost / kms).toFixed(2) : 0,
                    usageFrequency: `${(kms / 7).toFixed(0)} км/день`,
                    topDirections: topDirections // Тепер тут реальні дані
                }
            };

            await sendDashboardToTelegram(dashboardData);
            console.log('✅ Звіт успішно надіслано в Telegram');
        } catch (error) {
            console.error('❌ Помилка в Cron Job:', error);
        }
    });
};