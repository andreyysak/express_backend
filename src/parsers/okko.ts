import axios from 'axios';

export const parseOkko = async () => {
    try {
        const { data } = await axios.get('https://www.okko.ua/api/uk/fuel-map/all');

        const prices = data.data.map((item: any) => ({
            fuelType: item.name,
            price: parseFloat(item.price)
        }));

        return {
            station: 'OKKO',
            updatedAt: new Date(),
            prices
        };
    } catch (error: any) {
        console.error('OKKO Parser Error:', error.message);
        return null;
    }
};