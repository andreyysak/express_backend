import axios from 'axios';

export const parseWog = async () => {
    try {
        const { data } = await axios.get('https://api.wog.ua/fuel_types', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const fuelItems = data.data || data;

        const prices: { fuelType: string; price: number }[] = fuelItems.map((item: any) => ({
            fuelType: mapWogFuelName(item.name),
            price: parseFloat(item.price)
        })).filter((p: any) => p.price > 0);

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