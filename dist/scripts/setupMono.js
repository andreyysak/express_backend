"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const setup = async () => {
    const URL = process.env.MONO_WEBHOOK_URL;
    const TOKEN = process.env.MONO_API_TOKEN;
    try {
        const res = await axios_1.default.post('https://api.monobank.ua/personal/webhook', { webHookUrl: URL }, { headers: { 'X-Token': TOKEN } });
        console.log('✅ Webhook активовано:', res.data);
    }
    catch (e) {
        console.error('❌ Помилка:', e.response?.data || e.message);
    }
};
setup();
