import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../db';

const getBaseWeather = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { city: true }
    });
    if (!user?.city) throw new Error('City is not set');
    return { city: user.city, apiKey: process.env.OPENWEATHER_API_KEY };
};

export const getWeatherFull = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey, units: 'metric', lang: 'ua' }
        });
        res.json({
            city: data.name,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            wind_speed: data.wind.speed,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            visibility: data.visibility,
            sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('uk-UA'),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('uk-UA')
        });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const getTemperatureOnly = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey, units: 'metric' }
        });
        res.json({ temp: Math.round(data.main.temp) });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};

const getWindDirection = (deg: number): string => {
    const directions = [
        'Північний',
        'Північно-Східний',
        'Східний',
        'Південно-Східний',
        'Південний',
        'Південно-Західний',
        'Західний',
        'Північно-Західний'
    ];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
};

export const getWindOnly = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey, units: 'metric', lang: 'ua' }
        });

        res.json({
            speed: data.wind.speed,
            direction: getWindDirection(data.wind.deg),
            degrees: data.wind.deg,
            gust: data.wind.gust || 0
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getDescriptionOnly = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey, lang: 'ua' }
        });
        res.json({ description: data.weather[0].description });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
}

export const getForecastDay = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
            params: { q: city, appid: apiKey, units: 'metric', lang: 'ua', cnt: 8 }
        });
        res.json(data.list.map((item: any) => ({
            time: item.dt_txt,
            temp: Math.round(item.main.temp),
            desc: item.weather[0].description
        })));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const getForecastWeek = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
            params: { q: city, appid: apiKey, units: 'metric', lang: 'ua' }
        });
        const daily = data.list.filter((_: any, i: number) => i % 8 === 0);
        res.json(daily.map((item: any) => ({
            date: item.dt_txt.split(' ')[0],
            temp: Math.round(item.main.temp),
            desc: item.weather[0].description
        })));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const getSunCycle = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey }
        });

        const formatTime = (unix: number) => {
            return new Date(unix * 1000).toLocaleTimeString('uk-UA', {
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const sunrise = data.sys.sunrise;
        const sunset = data.sys.sunset;
        const now = Math.floor(Date.now() / 1000);

        let dayLength = sunset - sunrise;
        const hours = Math.floor(dayLength / 3600);
        const minutes = Math.floor((dayLength % 3600) / 60);

        res.json({
            sunrise: formatTime(sunrise),
            sunset: formatTime(sunset),
            day_length: `${hours} год ${minutes} хв`,
            is_daylight: now > sunrise && now < sunset
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getPressureAndHumidity = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey }
        });

        const pressureHpa = data.main.pressure;
        const pressureMmHg = Math.round(pressureHpa * 0.750062);
        const humidity = data.main.humidity;

        let humidityStatus = "Нормальна";
        if (humidity > 70) humidityStatus = "Висока (волого)";
        if (humidity < 30) humidityStatus = "Низька (сухо)";

        let pressureStatus = "Нормальний";
        if (pressureMmHg > 765) pressureStatus = "Високий (антициклон)";
        if (pressureMmHg < 750) pressureStatus = "Низький (циклон)";

        res.json({
            pressure: {
                hPa: pressureHpa,
                mmHg: pressureMmHg,
                status: pressureStatus
            },
            humidity: {
                percent: `${humidity}%`,
                status: humidityStatus
            }
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getVisibility = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey }
        });

        const visibilityMeters = data.visibility;
        const visibilityKm = (visibilityMeters / 1000).toFixed(1);

        let status = "Чудова";
        let advice = "Видимість не обмежена.";

        if (visibilityMeters < 100) {
            status = "Екстремально низька (Густий туман)";
            advice = "Рух транспорту небезпечний. Зупиніться у безпечному місці.";
        } else if (visibilityMeters < 1000) {
            status = "Дуже низька (Туман)";
            advice = "Увімкніть протитуманні ліхтарі, тримайте велику дистанцію.";
        } else if (visibilityMeters < 4000) {
            status = "Низька (Димка)";
            advice = "Будьте уважні за кермом, можливі опади або туман.";
        } else if (visibilityMeters < 10000) {
            status = "Середня";
            advice = "Видимість задовільна.";
        }

        res.json({
            meters: visibilityMeters,
            kilometers: `${visibilityKm} км`,
            status: status,
            advice: advice
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getDriverAdvice = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey, units: 'metric' }
        });
        let advice = "Умови сприятливі.";
        if (data.main.temp < 0) advice = "Можлива ожеледиця, будьте обережні.";
        if (data.wind.speed > 10) advice = "Сильний боковий вітер.";
        if (data.visibility < 1000) advice = "Погана видимість, увімкніть протитуманні фари.";
        res.json({ advice });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const getClothingAdvice = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey, units: 'metric' }
        });
        const t = data.main.temp;
        let clothing = "Футболка та шорти";
        if (t < 20) clothing = "Легка куртка або худі";
        if (t < 10) clothing = "Пальто або тепла куртка";
        if (t < 0) clothing = "Зимова куртка, шапка, рукавиці";
        res.json({ clothing });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const getPollutionRisk = async (req: Request, res: Response) => {
    try {
        const { city, apiKey } = await getBaseWeather(Number((req as any).user.userId));
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: apiKey }
        });
        res.json({ risk: data.main.pressure > 1020 ? "Високий ризик смогу (антициклон)" : "Ризик низький" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
};