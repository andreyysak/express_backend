import axios from 'axios';
import { AppError } from '../class/AppError';

const monoApi = axios.create({
    baseURL: process.env.MONO_API_URL || 'https://api.monobank.ua',
    headers: {
        'X-Token': process.env.MONO_API_TOKEN,
        'User-Agent': 'andreyysak-finance-app (https://github.com/andreyysak)'
    }
});

monoApi.interceptors.response.use(
    response => response,
    error => {
        console.error(`❌ Mono API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
        return Promise.reject(error);
    }
);

export const getMonoUserInfo = async () => {
    try {
        const response = await monoApi.get('/personal/client-info');
        return response.data;
    } catch (error: any) {
        throw new AppError(`Помилка отримання даних з Monobank: ${error.message}`, 502);
    }
};

export const getStatements = async (accountId: string, from: number, to?: number) => {
    try {
        const url = to
            ? `/personal/statement/${accountId}/${from}/${to}`
            : `/personal/statement/${accountId}/${from}`;

        const response = await monoApi.get(url);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 429) {
            throw new AppError('Ліміт запитів Monobank перевищено. Зачекайте 60 секунд', 429);
        }
        throw new AppError(`Помилка при завантаженні виписки Monobank: ${error.message}`, 502);
    }
};