import axios from "axios";

export async function sendPowerPhoto(imgUrl: string, caption: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
            chat_id: chatId,
            photo: imgUrl,
            caption: caption,
            parse_mode: 'Markdown'
        });
    } catch (e) {
        console.error("Error sending photo to Telegram", e);
    }
}