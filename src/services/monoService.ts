import axios from 'axios';
import { AppError } from '../class/AppError';

const monoApi = axios.create({
    baseURL: process.env.MONO_API_URL,
    headers: { 'X-Token': process.env.MONO_API_TOKEN }
});

export const getMonoUserInfo = async () => {
    try {
        const response = await monoApi.get('/personal/client-info');
        return response.data;
    } catch (error) {
        throw new AppError('Помилка отримання даних з Monobank', 502);
    }
};

export const getMonoTransactions = async (accountId: string, from: number) => {
    try {
        const response = await monoApi.get(`/personal/statement/${accountId}/${from}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 429) {
            throw new AppError('Занадто багато запитів до Monobank. Спробуйте через хвилину', 429);
        }
        throw new AppError('Не вдалося отримати транзакції Monobank', 502);
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
        throw new AppError('Помилка при завантаженні виписки Monobank', 502);
    }
};