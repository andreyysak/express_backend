import axios from 'axios';
import * as cheerio from 'cheerio';

export const parseOkko = async () => {
    try {
        const { data } = await axios.get('https://www.okko.ua/fuels', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const prices: { fuelType: string; price: number }[] = [];

        $('ul.list li.item').each((_, element) => {
            const $el = $(element);

            let fuelType = $el.find('mask text').text().trim();

            if (!fuelType) {
                const label = $el.find('.label').text().trim();
                const maskText = $el.find('text').text().trim();
                fuelType = label ? `${label}-${maskText}` : maskText;
            }

            const mainPrice = $el.find('.price').contents().not($el.find('sup')).text().trim();
            const cents = $el.find('.price sup').text().trim();

            if (mainPrice && fuelType) {
                const fullPrice = parseFloat(`${mainPrice}.${cents}`);
                prices.push({
                    fuelType: mapOkkoFuelName(fuelType),
                    price: fullPrice
                });
            }
        });

        return { station: 'OKKO', prices };
    } catch (error: any) {
        console.error('OKKO Parsing Error:', error.message);
        return { station: 'OKKO', prices: [] };
    }
};

const mapOkkoFuelName = (name: string): string => {
    const n = name.toUpperCase();
    if (n.includes('100')) return 'Pulls 100';
    if (n.includes('ДП') && n.includes('PULLS')) return 'Pulls Diesel';
    if (n.includes('ДП')) return 'Diesel';
    if (n.includes('95') && n.includes('PULLS')) return 'Pulls 95';
    if (n.includes('95')) return 'A-95';
    if (n.includes('ГАЗ')) return 'LPG';
    return name;
};