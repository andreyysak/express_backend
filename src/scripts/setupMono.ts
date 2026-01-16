import axios from 'axios';
import 'dotenv/config';

const setup = async () => {
    const URL = 'http://8.211.44.164/api/mono/webhook'; // Твоя адреса з Ngrok
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