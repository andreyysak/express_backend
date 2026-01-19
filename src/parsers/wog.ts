import axios from 'axios';
import * as cheerio from 'cheerio';

export const parseWog = async () => {
    try {
        const { data } = await axios.get('https://wog.ua/ua/fuels/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const prices: { fuelType: string; price: number }[] = [];

        // Шукаємо контейнери карток пального
        $('.s_fuel_item__2qQ_C').each((_, element) => {
            const $el = $(element);

            // Витягуємо тип (95, ДП, ГАЗ) та бренд (Mustang, Євро5)
            const type = $el.find('.s_type__1QSuj').text().trim();
            const brand = $el.find('.s_brand__oFHv0').text().trim();

            // Витягуємо ціну
            const priceText = $el.find('.s_price__W9J5t').text().trim();

            if (type && priceText) {
                const fullName = brand ? `${type} ${brand}` : type;
                prices.push({
                    fuelType: mapWogFuelName(fullName),
                    price: parseFloat(priceText.replace(',', '.'))
                });
            }
        });

        return {
            station: 'WOG',
            updatedAt: new Date(),
            prices
        };
    } catch (error: any) {
        console.error('WOG Parser Error:', error.message);
        return { station: 'WOG', prices: [] };
    }
};

const mapWogFuelName = (name: string): string => {
    const n = name.toUpperCase();
    if (n.includes('100')) return 'Mustang 100';
    if (n.includes('95') && n.includes('MUSTANG')) return 'Mustang 95';
    if (n.includes('95')) return 'A-95';
    if (n.includes('ДП') && n.includes('MUSTANG')) return 'Mustang Diesel';
    if (n.includes('ДП')) return 'Diesel';
    if (n.includes('ГАЗ')) return 'LPG';
    return name;
};