"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherForUser = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../db");
const getWeatherForUser = async (req, res) => {
    try {
        const userId = Number(req.user.userId);
        const user = await db_1.prisma.user.findUnique({
            where: { user_id: userId },
            select: { city: true }
        });
        if (!user?.city) {
            return res.status(400).json({ error: 'City is not set in your profile' });
        }
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const response = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather`, {
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
    }
    catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'City found in profile was not recognized by weather service' });
        }
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
};
exports.getWeatherForUser = getWeatherForUser;
