import { prisma } from "../db";

export const fetchWeatherReport = async (user: any) => {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const { data } = await require('axios').get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: user.city, appid: apiKey, units: 'metric', lang: 'ua' }
        });

        const t = Math.round(data.main.temp);
        let advice = t < 0 ? "❄️ Одягайтеся тепліше, на вулиці мороз." : "🍂 Гарної прогулянки!";

        return `☀️ **Погода у м. ${data.name}**\n\n` +
            `🌡 Температура: ${t}°C (відчувається як ${Math.round(data.main.feels_like)}°C)\n` +
            `💨 Вітер: ${data.wind.speed} м/с\n` +
            `☁️ Опис: ${data.weather[0].description}\n\n` +
            `💡 Порада: ${advice}`;
    } catch (e) {
        return `⚠️ Не вдалося отримати погоду для міста ${user.city}`;
    }
};

export const generateWeeklyReportData = async (userId: number) => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    const [transactions, fuel, trips] = await Promise.all([
        prisma.transaction.findMany({ where: { user_id: userId, date: { gte: startDate } } }),
        prisma.fuel.aggregate({ _sum: { price: true }, where: { user_id: userId, created_at: { gte: startDate } } }),
        prisma.trip.aggregate({ _sum: { kilometrs: true }, where: { user: { user_id: userId }, created_at: { gte: startDate } } })
    ]);

    const spent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

    return {
        period: `За тиждень (${startDate.toLocaleDateString()} - ${now.toLocaleDateString()})`,
        finance: {
            totalSpent: spent.toFixed(2),
            totalIncome: income.toFixed(2),
            savingsRate: income > 0 ? ((income - spent) / income * 100).toFixed(2) + '%' : '0%',
            forecast: 'Стабільно',
            anomaliesCount: 0
        },
        auto: {
            distance: trips._sum.kilometrs || 0,
            fuelCost: fuel._sum.price || 0,
            costPerKm: (trips._sum.kilometrs || 0) > 0 ? ((fuel._sum.price || 0) / (trips._sum.kilometrs || 0)).toFixed(2) : 0,
            usageFrequency: '7 днів',
            topDirections: []
        }
    };
};