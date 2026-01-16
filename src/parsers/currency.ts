import axios from 'axios';

export const parseCurrency = async () => {
    try {
        const { data } = await axios.get('https://api.monobank.ua/bank/currency');

        const usd = data.find((c: any) => c.currencyCodeA === 840 && c.currencyCodeB === 980);
        const eur = data.find((c: any) => c.currencyCodeA === 978 && c.currencyCodeB === 980);

        return {
            station: 'MONOBANK',
            updatedAt: new Date(),
            rates: [
                { code: 'USD', buy: usd.rateBuy, sell: usd.rateSell },
                { code: 'EUR', buy: eur.rateBuy, sell: eur.rateSell }
            ]
        };
    } catch (error: any) {
        console.error('Currency Parser Error:', error.message);
        return null;
    }
};