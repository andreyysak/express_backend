import { Request, Response } from 'express';
import axios from 'axios';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';

export const checkIpReputation = catchAsync(async (req: Request, res: Response) => {
    const { ip } = req.query;

    if (!ip) {
        throw new AppError('Будь ласка, вкажіть IP-адресу в query параметрах', 400);
    }

    try {
        const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
            params: {
                ipAddress: ip,
                maxAgeInDays: 90,
                verbose: true
            },
            headers: {
                'Key': process.env.ABUSEDB_KEY,
                'Accept': 'application/json'
            }
        });

        const data = response.data.data;

        res.json({
            status: 'success',
            data: {
                ip: data.ipAddress,
                abuseScore: data.abuseConfidenceScore,
                isWhitelisted: data.isWhitelisted,
                usageType: data.usageType,
                country: data.countryName,
                isp: data.isp,
                totalReports: data.totalReports,
                lastReportedAt: data.lastReportedAt
            }
        });
    } catch (error: any) {
        console.error('AbuseIPDB Error:', error.response?.data || error.message);
        throw new AppError('Помилка при перевірці IP в AbuseIPDB', 502);
    }
});