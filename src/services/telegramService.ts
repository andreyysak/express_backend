import axios from 'axios';

export const sendDashboardToTelegram = async (stats: any) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const message = `
🚀 *FINANCE & AUTO DASHBOARD* 🚀
📅 Період: ${stats.period}

💰 *ФІНАНСОВИЙ ЗВІТ*
• Витрати: \`${stats.finance.totalSpent} грн\`
• Доходи: \`${stats.finance.totalIncome} грн\`
• Savings Rate: \`${stats.finance.savingsRate}\`
• Прогноз до кінця місяця: \`${stats.finance.forecast} грн\`

🚗 *АВТО ТА ПОЇЗДКИ*
• Загальний пробіг: \`${stats.auto.distance} км\`
• Витрати на пальне: \`${stats.auto.fuelCost} грн\`
• Ефективність: \`${stats.auto.costPerKm} грн/км\`
• Частота використання: \`${stats.auto.usageFrequency}\`

📊 *ТОП НАПРЯМКІВ*
${stats.auto.topDirections.map((d: any) => `📍 ${d.direction}: ${d._sum.kilometrs} км`).join('\n')}

⚠️ *АН ОМАЛІЇ ТА ЗАУВАЖЕННЯ*
${stats.finance.anomaliesCount > 0 ? `❗ Виявлено ${stats.finance.anomaliesCount} аномальних витрат!` : '✅ Аномалій не виявлено'}
    `;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error('Telegram Error:', error);
    }
};