import cron from 'node-cron';
import { prisma } from "../db";
import { sendDashboardToTelegram, sendTelegramMessage } from './telegramService';
import { runAllParsers } from '../parsers';
import { getStatements } from './monoService';
import { getCategoryByMcc } from '../utils/mccMapper';
import { fetchWeatherReport, generateWeeklyReportData } from '../utils/reportHelpers';
import logger from '../logger';
import { formatPowerMessage, getPowerShutdownInfo, hasPowerChanged } from "../parsers/power_outage_schedule";
import { sendPowerPhoto } from "../utils/powerOutage";
import { checkAsusPowerMonitors } from '../utils/powerMonitor';

export const initCronJobs = () => {
    setInterval(async () => {
        const startTime = new Date().toLocaleTimeString();
        try {
            console.log(`[${startTime}] 🔍 Починаю перевірку Asus Power Monitors...`);
            await checkAsusPowerMonitors();
            console.log(`[${startTime}] ✅ Перевірка Asus завершена успішно.`);
        } catch (error: any) {
            logger.error(`[${startTime}] ❌ Asus Monitor Interval Error: ${error?.message || error}`);
        }
    }, 120000);

    cron.schedule('0 8 * * *', async () => {
        try {
            const data = await runAllParsers();

            const fuelToSave: any[] = [];
            if (data.okko?.prices) data.okko.prices.forEach((p: any) => fuelToSave.push({ station: 'OKKO', fuel_type: p.fuelType, price: p.price }));
            if (data.wog?.prices) data.wog.prices.forEach((p: any) => fuelToSave.push({ station: 'WOG', fuel_type: p.fuelType, price: p.price }));

            const currencyToSave: any[] = [];
            if (data.currency?.rates) data.currency.rates.forEach((r: any) => {
                currencyToSave.push({ code: r.code, rate_buy: r.buy, rate_sell: r.sell });
            });

            await Promise.all([
                fuelToSave.length > 0 ? prisma.fuelPriceHistory.createMany({ data: fuelToSave }) : Promise.resolve(),
                currencyToSave.length > 0 ? prisma.currencyHistory.createMany({ data: currencyToSave }) : Promise.resolve()
            ]);

            let reportMsg = `⛽ *Ціни на пальне:*\n`;
            if (data.okko?.prices) reportMsg += `OKKO: ${data.okko.prices.map((p:any) => `${p.fuelType}: ${p.price}`).join(', ')}\n`;
            if (data.wog?.prices) reportMsg += `WOG: ${data.wog.prices.map((p:any) => `${p.fuelType}: ${p.price}`).join(', ')}\n`;

            reportMsg += `\n💵 *Курс валют:*\n`;
            if (data.currency?.rates) {
                reportMsg += data.currency.rates.map((r:any) => `*${r.code}*: ${r.buy} / ${r.sell}`).join('\n');
            }

            const user = await prisma.user.findFirst({ where: { city: { not: null } } });
            if (user) {
                const weatherMsg = await fetchWeatherReport(user);
                const fullMessage = `${reportMsg}\n\n${weatherMsg}`;
                await sendTelegramMessage(fullMessage);
            }

            logger.info('Morning cron jobs completed successfully');
        } catch (error) {
            logger.error('Morning Cron Error');
        }
    });

    cron.schedule('5 * * * *', async () => {
        try {
            const accounts = await prisma.account.findMany({
                where: { mono_account_id: { not: null } }
            });

            for (const acc of accounts) {
                const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
                const transactions = await getStatements(acc.mono_account_id!, oneDayAgo);

                for (const tx of transactions) {
                    const amount = tx.amount / 100;
                    const txDate = new Date(tx.time * 1000);

                    const exists = await prisma.transaction.findFirst({
                        where: {
                            user_id: acc.user_id,
                            amount,
                            date: txDate,
                            description: tx.description
                        }
                    });

                    if (!exists) {
                        const categoryName = getCategoryByMcc(tx.mcc);
                        let category = await prisma.category.findFirst({
                            where: { user_id: acc.user_id, name: categoryName }
                        });

                        if (!category) {
                            category = await prisma.category.create({
                                data: {
                                    user_id: acc.user_id,
                                    name: categoryName,
                                    type: amount < 0 ? 'EXPENSE' : 'INCOME'
                                }
                            });
                        }

                        await prisma.$transaction([
                            prisma.transaction.create({
                                data: {
                                    user_id: acc.user_id,
                                    account_id: acc.account_id,
                                    category_id: category.category_id,
                                    amount,
                                    description: tx.description,
                                    date: txDate
                                }
                            }),
                            prisma.account.update({
                                where: { account_id: acc.account_id },
                                data: { balance: { increment: amount } }
                            })
                        ]);

                        const emoji = amount < 0 ? '💸' : '💰';
                        await sendTelegramMessage(`${emoji} **${acc.name}**: \`${amount.toFixed(2)} ${acc.currency}\`\n📝 \`${tx.description}\``);
                    }
                }
            }
        } catch (error) {
            logger.error('Mono Cron Error');
        }
    });

    cron.schedule('0 9 * * 1', async () => {
        try {
            const user = await prisma.user.findFirst();
            if (user) {
                const reportData = await generateWeeklyReportData(user.user_id);
                await sendDashboardToTelegram(reportData);
            }
        } catch (error) {
            logger.error('Weekly Report Cron Error');
        }
    });

    cron.schedule('*/15 * * * *', async () => {
        try {
            const data = await getPowerShutdownInfo();

            if (data && data.rawInfo) {
                if (hasPowerChanged(data.rawInfo)) {
                    const formattedMessage = formatPowerMessage(data.rawInfo);

                    if (data.imgUrl) {
                        await sendPowerPhoto(data.imgUrl, formattedMessage);
                    } else {
                        await sendTelegramMessage(formattedMessage);
                    }
                    console.log('✅ Графік змінився, повідомлення надіслано.');
                } else {
                    console.log('ℹ️ Графік світла без змін, пропускаємо.');
                }
            }
        } catch (error) {
            logger.error('Power Outage Schedule Cron Error');
        }
    });
};