import cron from 'node-cron';
import { prisma } from "../db";
import {sendDashboardToTelegram, sendTelegramMessage} from './telegramService';
import { runAllParsers } from '../parsers';
import { getMonoTransactions } from './monoService'; // Імпортуємо твій сервіс

export const initCronJobs = () => {
    cron.schedule('0 8 * * *', async () => {
        console.log('⛽️💰 Запуск щоденного парсингу цін та валют...');
        try {
            const data = await runAllParsers();
            const fuelToSave: any[] = [];
            if (data.okko?.prices) {
                data.okko.prices.forEach((p: any) => fuelToSave.push({ station: 'OKKO', fuel_type: p.fuelType, price: p.price }));
            }
            if (data.wog?.prices) {
                data.wog.prices.forEach((p: any) => fuelToSave.push({ station: 'WOG', fuel_type: p.fuelType, price: p.price }));
            }

            const currencyToSave: any[] = [];
            if (data.currency?.rates) {
                data.currency.rates.forEach((r: any) => {
                    currencyToSave.push({ code: r.code, rate_buy: r.buy, rate_sell: r.sell });
                });
            }

            await Promise.all([
                fuelToSave.length > 0 ? prisma.fuelPriceHistory.createMany({ data: fuelToSave }) : Promise.resolve(),
                currencyToSave.length > 0 ? prisma.currencyHistory.createMany({ data: currencyToSave }) : Promise.resolve()
            ]);
            console.log('✅ Всі дані успішно оновлено');
        } catch (error) {
            console.error('❌ Помилка в Cron Job (Parsers):', error);
        }
    });

    cron.schedule('5 * * * *', async () => {
        console.log('🔄 Синхронізація транзакцій Monobank...');
        try {
            const accountId = '0';
            const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

            const transactions = await getMonoTransactions(accountId, oneDayAgo);
            let newTransactionsCount = 0;

            for (const tx of transactions) {
                const amount = tx.amount / 100;
                const txDate = new Date(tx.time * 1000);

                const exists = await prisma.transaction.findFirst({
                    where: {
                        date: txDate,
                        amount: amount,
                        description: tx.description
                    }
                });

                if (!exists) {
                    await prisma.transaction.create({
                        data: {
                            user_id: 1,
                            account_id: 1,
                            category_id: 1,
                            amount: amount,
                            description: tx.description,
                            date: txDate
                        }
                    });

                    newTransactionsCount++;

                    const emoji = amount < 0 ? '💸' : '💰';
                    const message = `${emoji} **Нова транзакція Monobank**\n\n` +
                        `📝 Опис: \`${tx.description}\`\n` +
                        `💵 Сума: \`${amount.toFixed(2)} грн\`\n` +
                        `📅 Дата: \`${txDate.toLocaleString('uk-UA')}\``;

                    await sendTelegramMessage(message);
                }
            }

            if (newTransactionsCount > 0) {
                console.log(`✅ Синхронізація завершена. Додано ${newTransactionsCount} нових повідомлень у ТГ.`);
            }
        } catch (error) {
            console.error('❌ Помилка в Cron Job (Mono Sync):', error);
        }
    });

    cron.schedule('0 9 * * 1', async () => {
        console.log('⏳ Запуск щотижневого звіту...');
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
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
                    topDirections: topDirections
                }
            };

            await sendDashboardToTelegram(dashboardData);
            console.log('✅ Звіт успішно надіслано в Telegram');
        } catch (error) {
            console.error('❌ Помилка в Cron Job (Weekly Report):', error);
        }
    });
};