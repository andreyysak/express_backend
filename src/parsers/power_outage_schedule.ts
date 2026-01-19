import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const URL = "https://hoe.com.ua/page/pogodinni-vidkljuchennja";
const BASE = "https://hoe.com.ua";
const STATE_FILE = path.join(__dirname, '../../last_power_state.txt');

export const getPowerShutdownInfo = async () => {
    try {
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        // Знаходимо картинку
        const imgPath = $(".post img").attr("src");
        const imgUrl = imgPath ? BASE + imgPath : null;

        // Шукаємо підчергу 5.2
        let rawInfo = "";
        $(".post ul li").each((_, el) => {
            const text = $(el).text().trim();
            if (text.includes("підчерга 5.2")) {
                rawInfo = text;
            }
        });

        return { imgUrl, rawInfo };
    } catch (error) {
        console.error("Power Parser Error:", error);
        return null;
    }
};

export const formatPowerMessage = (rawText: string): string => {
    if (!rawText.includes("–")) return rawText;

    const [header, timesRaw] = rawText.split("–");
    const times = timesRaw.split(",");

    let message = `💡 **${header.trim()}**\n`;
    times.forEach(t => {
        message += `🔹 ${t.trim()}\n`;
    });

    return message.trim();
};

export const hasPowerChanged = (newText: string): boolean => {
    const newHash = crypto.createHash('md5').update(newText).digest('hex');

    let oldHash = "";
    if (fs.existsSync(STATE_FILE)) {
        oldHash = fs.readFileSync(STATE_FILE, 'utf-8').trim();
    }

    if (newHash !== oldHash) {
        fs.writeFileSync(STATE_FILE, newHash);
        return true;
    }
    return false;
};