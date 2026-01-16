import axios from 'axios';
import 'dotenv/config';

const setup = async () => {
    const URL = process.env.MONO_WEBHOOK_URL;
    const TOKEN = process.env.MONO_API_TOKEN;

    try {
        const res = await axios.post(
            'https://api.monobank.ua/personal/webhook',
            { webHookUrl: URL },
            { headers: { 'X-Token': TOKEN } }
        );
        console.log('✅ Webhook активовано:', res.data);
    } catch (e: any) {
        console.error('❌ Помилка:', e.response?.data || e.message);
    }
};

setup();
