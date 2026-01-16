import axios from 'axios';

export const sendTelegramReport = async (stats: any) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const message = `
📊 *Звіт за ${stats.period}*

💰 *ФІНАНСИ*
➖ Витрати: ${stats.finance.totalSpent} грн
➕ Доходи: ${stats.finance.totalIncome} грн
📑 Транзакцій: ${stats.finance.count}

🚗 *АВТО*
⛽️ Заправлено: ${stats.auto.fuelLiters} л
💸 Витрати на пальне: ${stats.auto.fuelCost} грн
🛣 Пробіг: ${stats.auto.distance} км
🏁 Поїздок: ${stats.auto.tripsCount}
    `;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });
        return { success: true };
    } catch (error) {
        console.error('Telegram Error:', error);
        return { success: false };
    }
};