import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../db';

export const getWeatherForUser = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).user.userId);

        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { city: true }
        });

        if (!user?.city) {
            return res.status(400).json({ error: 'City is not set in your profile' });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: user.city,
                appid: apiKey,
                units: 'metric',
                lang: 'ua'
            }
        });

        const { main, weather, wind, name, sys } = response.data;

        res.json({
            city: name,
            country: sys.country,
            temp: Math.round(main.temp),
            feels_like: Math.round(main.feels_like),
            description: weather[0].description,
            icon: weather[0].icon,
            humidity: main.humidity,
            wind_speed: wind.speed
        });
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'City found in profile was not recognized by weather service' });
        }
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
};