import axios from 'axios';

export const parseWog = async () => {
    try {
        const { data } = await axios.get('https://api.wog.ua/fuel_stations');

        const allPrices = data.data.stations.flatMap((s: any) => s.prices || []);

        const uniquePrices = Array.from(new Map(allPrices.map((p: any) => [p.name, p.price])).entries())
            .map(([name, price]) => ({
                fuelType: name,
                price: parseFloat(price as string)
            }));

        return {
            station: 'WOG',
            updatedAt: new Date(),
            prices: uniquePrices
        };
    } catch (error: any) {
        console.error('WOG Parser Error:', error.message);
        return null;
    }
};