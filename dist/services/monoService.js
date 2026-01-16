"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonoTransactions = exports.getMonoUserInfo = void 0;
const axios_1 = __importDefault(require("axios"));
const AppError_1 = require("../class/AppError");
const monoApi = axios_1.default.create({
    baseURL: process.env.MONO_API_URL,
    headers: { 'X-Token': process.env.MONO_API_TOKEN }
});
const getMonoUserInfo = async () => {
    try {
        const response = await monoApi.get('/personal/client-info');
        return response.data;
    }
    catch (error) {
        throw new AppError_1.AppError('Помилка отримання даних з Monobank', 502);
    }
};
exports.getMonoUserInfo = getMonoUserInfo;
const getMonoTransactions = async (accountId, from) => {
    try {
        const response = await monoApi.get(`/personal/statement/${accountId}/${from}`);
        return response.data;
    }
    catch (error) {
        throw new AppError_1.AppError('Не вдалося отримати транзакції Monobank', 502);
    }
};
exports.getMonoTransactions = getMonoTransactions;
