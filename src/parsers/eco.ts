import axios from 'axios';
import * as cheerio from 'cheerio';

export const parseEcoData = async () => {
    try {
        // Парсимо сторінку Хмельницького на SaveEcoBot
        const url = 'https://www.saveecobot.com/maps/khmelnytskyi';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // Шукаємо індекс якості повітря (AQI)
        // На сайті він зазвичай у великому блоці з класом на кшталт 'aqi-value'
        const aqiValue = $('.aqi-number').first().text().trim() || '0';
        const aqiDescription = $('.aqi-description').first().text().trim() || 'Немає даних';

        // Шукаємо радіаційний фон (nSv/h - нанозіверти)
        // Зазвичай відображається як "Радіаційний фон: 120 нЗв/год"
        let radiation = '0';
        $('span, div').each((_, el) => {
            const text = $(el).text();
            if (text.includes('нЗв/год') || text.includes('nSv/h')) {
                const match = text.match(/\d+/);
                if (match) radiation = match[0];
            }
        });

        return {
            station: 'SaveEcoBot',
            city: 'Khmelnytskyi',
            aqi: parseInt(aqiValue),
            aqiStatus: aqiDescription,
            radiation: parseInt(radiation),
            updatedAt: new Date()
        };
    } catch (error: any) {
        console.error('Eco Parser Error:', error.message);
        return {
            station: 'SaveEcoBot',
            aqi: 0,
            radiation: 0,
            error: error.message
        };
    }
};